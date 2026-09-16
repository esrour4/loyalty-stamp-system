import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenuIfEmpty,
} from './server/firestoreService';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper: Normalize Zender API URL
function normalizeZenderUrl(rawUrl: string, serviceType: 'whatsapp' | 'sms' = 'whatsapp'): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // If user passed only the base domain (e.g. https://zender.example.com or https://example.com/subpath)
  if (!url.includes('/api/send/')) {
    url = `${url}/api/send/${serviceType}`;
  }

  return url;
}

// Helper: Normalize phone number
function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Trim spaces and special formatting chars
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, '');

  // If user entered local Syrian number e.g. 0944112233
  if (/^09\d{8}$/.test(cleaned)) {
    cleaned = '+963' + cleaned.substring(1);
  }
  // If user entered local Syrian without 0 e.g. 944112233
  else if (/^9\d{8}$/.test(cleaned)) {
    cleaned = '+963' + cleaned;
  }

  return cleaned;
}

// 963 CRM WhatsApp / SMS Proxy Endpoint (Solves CORS and handles all 963 CRM payload formats)
app.post('/api/zender/send', async (req, res) => {
  try {
    const { apiUrl, apiKey, whatsappDeviceId, recipient, message, type = 'text', mode = 'whatsapp' } = req.body;

    if (!apiUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing 963 CRM API URL. Please enter your 963 CRM instance URL in Owner Settings.',
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing 963 CRM Secret Key. Please enter your API secret key from 963 CRM > API page.',
      });
    }

    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipient phone number.',
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.',
      });
    }

    // Notice: For WhatsApp in 963 CRM, 'account' is a required parameter.
    const accountId = (whatsappDeviceId || '').trim();
    if (!accountId && mode === 'whatsapp') {
      return res.status(400).json({
        success: false,
        error: 'Missing WhatsApp Account ID (معرف حساب الواتساب مطلوب في 963 CRM). Please enter the Account ID / Unique ID from 963 CRM > WhatsApp > Accounts.',
        details: '963 CRM requires the "account" parameter for WhatsApp API to identify which linked phone sends the message.',
      });
    }

    const normalizedUrl = normalizeZenderUrl(apiUrl, mode === 'sms' ? 'sms' : 'whatsapp');
    const cleanedRecipientWithPlus = cleanPhoneNumber(recipient);
    const cleanedRecipientDigitsOnly = cleanedRecipientWithPlus.replace(/^\+/, '');

    console.log(`[963 CRM Gateway] Target URL: ${normalizedUrl}`);
    console.log(`[963 CRM Gateway] Account: "${accountId}", Recipient: "${cleanedRecipientWithPlus}" / "${cleanedRecipientDigitsOnly}"`);

    // Helper: Execute a dispatch attempt
    const executeAttempt = async (
      sendUrl: string,
      contentType: 'urlencoded' | 'formdata' | 'json' | 'query',
      phoneToUse: string
    ): Promise<{ ok: boolean; status: number; text: string; parsed: any }> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        let fetchUrl = sendUrl;
        let options: RequestInit = {
          method: 'POST',
          signal: controller.signal,
        };

        if (contentType === 'urlencoded') {
          const formParams = new URLSearchParams();
          formParams.append('secret', apiKey.trim());
          if (accountId) formParams.append('account', accountId);
          formParams.append('recipient', phoneToUse);
          formParams.append('type', type || 'text');
          formParams.append('message', message);

          options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'CoffeeRewards-ZenderBridge/1.0',
          };
          options.body = formParams.toString();
        } else if (contentType === 'formdata') {
          const formData = new FormData();
          formData.append('secret', apiKey.trim());
          if (accountId) formData.append('account', accountId);
          formData.append('recipient', phoneToUse);
          formData.append('type', type || 'text');
          formData.append('message', message);

          options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'CoffeeRewards-ZenderBridge/1.0',
          };
          options.body = formData;
        } else if (contentType === 'query') {
          const queryParams = new URLSearchParams();
          queryParams.append('secret', apiKey.trim());
          if (accountId) queryParams.append('account', accountId);
          queryParams.append('recipient', phoneToUse);
          queryParams.append('type', type || 'text');
          queryParams.append('message', message);

          fetchUrl = `${sendUrl}${sendUrl.includes('?') ? '&' : '?'}${queryParams.toString()}`;
          options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'CoffeeRewards-ZenderBridge/1.0',
          };
        } else {
          // json
          options.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'CoffeeRewards-ZenderBridge/1.0',
          };
          options.body = JSON.stringify({
            secret: apiKey.trim(),
            account: accountId,
            recipient: phoneToUse,
            type: type || 'text',
            message: message,
          });
        }

        const response = await fetch(fetchUrl, options);
        const text = await response.text();
        let parsed: any = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { raw: text };
        }

        clearTimeout(timeoutId);
        return { ok: response.ok, status: response.status, text, parsed };
      } catch (err: any) {
        clearTimeout(timeoutId);
        return { ok: false, status: 0, text: err.message, parsed: { error: err.message } };
      }
    };

    // Strategy Pipeline:
    // 1. URL-Encoded with international digits-only phone (Zender's most common standard e.g. 963944112233)
    // 2. URL-Encoded with + phone (e.g. +963944112233)
    // 3. FormData (multipart) with digits-only
    // 4. Query params GET/POST
    // 5. JSON body

    console.log('[Zender Gateway] Attempting Strategy 1: URL-Encoded (digits-only phone)...');
    let result = await executeAttempt(normalizedUrl, 'urlencoded', cleanedRecipientDigitsOnly);

    if (!result.ok || result.status === 400 || (result.parsed && result.parsed.status === 400)) {
      console.log('[Zender Gateway] Attempting Strategy 2: URL-Encoded (+ phone)...');
      const result2 = await executeAttempt(normalizedUrl, 'urlencoded', cleanedRecipientWithPlus);
      if (result2.ok || (result2.parsed && (result2.parsed.status === 200 || result2.parsed.success))) {
        result = result2;
      } else {
        console.log('[Zender Gateway] Attempting Strategy 3: FormData...');
        const result3 = await executeAttempt(normalizedUrl, 'formdata', cleanedRecipientDigitsOnly);
        if (result3.ok || (result3.parsed && (result3.parsed.status === 200 || result3.parsed.success))) {
          result = result3;
        } else {
          console.log('[Zender Gateway] Attempting Strategy 4: Query params...');
          const result4 = await executeAttempt(normalizedUrl, 'query', cleanedRecipientDigitsOnly);
          if (result4.ok || (result4.parsed && (result4.parsed.status === 200 || result4.parsed.success))) {
            result = result4;
          }
        }
      }
    }

    const isSuccess =
      result.status === 200 ||
      (result.parsed && (result.parsed.status === 200 || result.parsed.status === 'success' || result.parsed.success === true));

    if (isSuccess) {
      return res.json({
        success: true,
        status: result.status || 200,
        data: result.parsed || result.text,
        endpointUsed: normalizedUrl,
        recipient: cleanedRecipientWithPlus,
        sentAccount: accountId,
      });
    }

    // If failed, extract specific helpful error info
    const rawError = result.parsed?.message || result.parsed?.error || result.parsed?.description || result.text;
    let friendlyError = rawError;

    if (typeof rawError === 'string' && rawError.includes('Invalid Parameters')) {
      friendlyError = `Invalid Parameters (بيانات غير مكتملة في 963 CRM): تأكد من إدخال معرف حساب الواتساب (Account ID) من 963 CRM > WhatsApp > Accounts ورقم الهاتف بالصيغة الدولية.`;
    } else if (typeof rawError === 'string' && rawError.includes('Invalid API')) {
      friendlyError = `Invalid API Secret (المفتاح السري غير صحيح): تأكد من نسخ المفتاح السري من 963 CRM > صفحة API.`;
    }

    return res.status(result.status >= 400 ? result.status : 400).json({
      success: false,
      status: result.status || 400,
      error: friendlyError,
      rawZenderResponse: result.text,
      data: result.parsed,
      endpointUsed: normalizedUrl,
      recipient: cleanedRecipientWithPlus,
      sentAccount: accountId,
      parametersSent: {
        secret: apiKey ? '••••••••' : '(empty)',
        account: accountId || '(empty - REQUIRED for WhatsApp)',
        recipient: cleanedRecipientDigitsOnly,
        type: 'text',
      },
    });
  } catch (error: any) {
    console.error('[Server Internal Error]', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error while processing Zender dispatch.',
    });
  }
});

// ==========================================
// CLOUD FIRESTORE MENU DATABASE API ROUTES
// ==========================================

// 1. Get all menu categories
app.get('/api/menu/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    return res.json({ success: true, categories });
  } catch (error: any) {
    console.error('[API /api/menu/categories GET error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to fetch menu categories from Firestore' });
  }
});

// 2. Add new menu category
app.post('/api/menu/categories', async (req, res) => {
  try {
    const { nameEn, nameAr, descriptionEn, descriptionAr, order, icon } = req.body;
    if (!nameEn && !nameAr) {
      return res.status(400).json({ success: false, error: 'Category name is required in English or Arabic.' });
    }
    const category = await addCategory({ nameEn, nameAr, descriptionEn, descriptionAr, order, icon });
    return res.status(201).json({ success: true, category });
  } catch (error: any) {
    console.error('[API /api/menu/categories POST error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to add menu category to Firestore' });
  }
});

// 3. Update existing menu category
app.put('/api/menu/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await updateCategory(id, req.body);
    return res.json({ success: true, category });
  } catch (error: any) {
    console.error('[API /api/menu/categories PUT error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to update menu category in Firestore' });
  }
});

// 4. Delete menu category (cascades items)
app.delete('/api/menu/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategory(id);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API /api/menu/categories DELETE error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to delete menu category from Firestore' });
  }
});

// 5. Get all menu items
app.get('/api/menu/items', async (req, res) => {
  try {
    const items = await getMenuItems();
    return res.json({ success: true, items });
  } catch (error: any) {
    console.error('[API /api/menu/items GET error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to fetch menu items from Firestore' });
  }
});

// 6. Add new menu item
app.post('/api/menu/items', async (req, res) => {
  try {
    const { categoryId, nameEn, nameAr, descriptionEn, descriptionAr, price, currency, isAvailable, image, calories, tag } = req.body;
    if (!nameEn && !nameAr) {
      return res.status(400).json({ success: false, error: 'Item name is required in English or Arabic.' });
    }
    const item = await addMenuItem({
      categoryId,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      price: Number(price) || 0,
      currency,
      isAvailable: isAvailable !== false,
      image,
      calories: calories ? Number(calories) : undefined,
      tag,
    });
    return res.status(201).json({ success: true, item });
  } catch (error: any) {
    console.error('[API /api/menu/items POST error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to add menu item to Firestore' });
  }
});

// 7. Update menu item
app.put('/api/menu/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await updateMenuItem(id, req.body);
    return res.json({ success: true, item });
  } catch (error: any) {
    console.error('[API /api/menu/items PUT error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to update menu item in Firestore' });
  }
});

// 8. Delete menu item
app.delete('/api/menu/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMenuItem(id);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API /api/menu/items DELETE error]', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to delete menu item from Firestore' });
  }
});

// 9. Manual menu re-seed trigger
app.post('/api/menu/seed', async (req, res) => {
  try {
    await seedMenuIfEmpty();
    const categories = await getCategories();
    const items = await getMenuItems();
    return res.json({ success: true, categories, items });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// Vite middleware / Static Serving
async function startServer() {
  // Ensure Cloud Firestore menu collections are initialized
  try {
    await seedMenuIfEmpty();
  } catch (err) {
    console.warn('[Firestore] Background auto-seed notice:', err);
  }
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // 1. Serve hashed static assets with immutable long-term caching
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // 2. Prevent returning HTML for missing assets (avoids SyntaxError '<' in script tags)
    app.use('/assets/*', (req, res) => {
      res.status(404).type('text/plain').send('Asset not found');
    });

    // 3. Serve other public static files with no HTML caching
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('.webmanifest')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    // 4. SPA Fallback with strict no-cache headers on index.html
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Coffee Loyalty Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
