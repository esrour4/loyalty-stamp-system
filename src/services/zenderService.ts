import { Customer, StoreSettings, WhatsAppLog } from '../types';

export interface ZenderSendResult {
  log: WhatsAppLog;
  success: boolean;
  statusCode?: number;
  error?: string;
  details?: string;
  endpointUsed?: string;
}

export class ZenderService {
  /**
   * Interpolate template string with customer & store variables
   */
  static interpolate(
    template: string,
    customer: Customer,
    settings: StoreSettings,
    extra: { stampsAdded?: number; rewardName?: string } = {}
  ): string {
    const shopName = settings.shopNameAr || settings.shopNameEn || 'Brew & Bean';

    // Generate direct customer digital card & login URL
    let loginUrl = '';
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      loginUrl = `${origin}${pathname}?card=${encodeURIComponent(customer.cardNumber)}`;
    } else {
      loginUrl = `https://crm.963s.co?card=${encodeURIComponent(customer.cardNumber)}`;
    }

    return (template || '')
      .replace(/{customer_name}/g, customer.name)
      .replace(/{shop_name}/g, shopName)
      .replace(/{card_number}/g, customer.cardNumber)
      .replace(/{login_link}/g, loginUrl)
      .replace(/{login_url}/g, loginUrl)
      .replace(/{card_link}/g, loginUrl)
      .replace(/{card_url}/g, loginUrl)
      .replace(/{stamps_count}/g, String(customer.currentStamps))
      .replace(/{points}/g, String(customer.totalPoints))
      .replace(/{reward_name}/g, extra.rewardName || 'Free Coffee')
      .replace(/{stamps_added}/g, String(extra.stampsAdded || 1));
  }

  /**
   * Dispatch a message through the backend Zender WhatsApp proxy
   */
  static async sendWhatsApp(
    customer: Customer,
    settings: StoreSettings,
    templateType: 'welcome' | 'stamp' | 'redemption' | 'birthday' | 'promo' | 'test',
    customMessage?: string,
    extra: { stampsAdded?: number; rewardName?: string } = {},
    overrideConfig?: { apiUrl?: string; apiKey?: string; whatsappDeviceId?: string; enabled?: boolean }
  ): Promise<WhatsAppLog> {
    const res = await this.dispatch(customer, settings, templateType, customMessage, extra, overrideConfig);
    return res.log;
  }

  /**
   * Full dispatch method returning complete result and diagnostics
   */
  static async dispatch(
    customer: Customer,
    settings: StoreSettings,
    templateType: 'welcome' | 'stamp' | 'redemption' | 'birthday' | 'promo' | 'test',
    customMessage?: string,
    extra: { stampsAdded?: number; rewardName?: string } = {},
    overrideConfig?: { apiUrl?: string; apiKey?: string; whatsappDeviceId?: string; enabled?: boolean }
  ): Promise<ZenderSendResult> {
    const config = {
      ...settings.zender,
      ...(overrideConfig || {}),
    };

    let message = customMessage || '';

    if (!message) {
      switch (templateType) {
        case 'welcome':
          message = this.interpolate(config.welcomeTemplate, customer, settings);
          break;
        case 'stamp':
          message = this.interpolate(config.stampAddedTemplate, customer, settings, extra);
          break;
        case 'redemption':
          message = this.interpolate(config.rewardRedeemedTemplate, customer, settings, extra);
          break;
        case 'birthday':
          message = this.interpolate(config.birthdayTemplate, customer, settings);
          break;
        case 'promo':
          message = this.interpolate(config.promoTemplate, customer, settings);
          break;
        case 'test':
          message = `☕ [${settings.shopNameEn || 'Coffee Shop'}] اختبار بوابة واتساب (963 CRM API). النظام يعمل بنجاح! Test notification from Coffee Rewards.`;
          break;
      }
    }

    const logEntry: WhatsAppLog = {
      id: 'wa_' + Math.random().toString(36).substring(2, 9),
      recipientPhone: customer.phone,
      customerName: customer.name,
      templateType,
      message,
      status: 'simulated',
      timestamp: new Date().toISOString(),
    };

    // If live Zender API is configured, route via server proxy to prevent CORS issues
    if (config.apiUrl && config.apiKey) {
      try {
        const response = await fetch('/api/zender/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            whatsappDeviceId: config.whatsappDeviceId,
            recipient: customer.phone,
            message: message,
            type: 'text',
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          logEntry.status = 'delivered';
          logEntry.responsePayload = typeof data.data === 'object' ? JSON.stringify(data.data) : String(data.data || 'OK 200');
          return {
            log: logEntry,
            success: true,
            statusCode: data.status || 200,
            endpointUsed: data.endpointUsed,
          };
        } else {
          logEntry.status = 'failed';
          const errMsg = data.error || `HTTP ${response.status}: Gateway error`;
          logEntry.responsePayload = `Failed: ${errMsg} (Endpoint: ${data.endpointUsed || config.apiUrl})`;
          return {
            log: logEntry,
            success: false,
            statusCode: response.status,
            error: errMsg,
            details: data.details || (typeof data.data === 'object' ? JSON.stringify(data.data) : undefined),
            endpointUsed: data.endpointUsed,
          };
        }
      } catch (err: any) {
        logEntry.status = 'failed';
        logEntry.responsePayload = `Proxy error: ${err?.message || 'Network failure'}`;
        return {
          log: logEntry,
          success: false,
          error: `Could not reach local server proxy: ${err?.message}`,
        };
      }
    } else {
      logEntry.status = 'simulated';
      logEntry.responsePayload = 'Simulated dispatch (Provide 963 CRM API URL & Secret Key in Owner Panel to send live)';
      return {
        log: logEntry,
        success: false,
        error: 'Missing 963 CRM API URL or Secret Key. Please configure them in the Owner Panel.',
      };
    }
  }
}

