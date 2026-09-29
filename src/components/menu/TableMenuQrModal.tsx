import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Wifi,
  Sparkles,
  Coffee,
  Check,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Maximize2,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem } from '../../types';

interface TableMenuQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: string;
  initialCategoryId?: string;
  initialItemId?: string;
}

export const TableMenuQrModal: React.FC<TableMenuQrModalProps> = ({
  isOpen,
  onClose,
  initialTable = 'Table 1',
  initialCategoryId,
  initialItemId,
}) => {
  const {
    settings,
    language,
    t,
    menuCategories,
    menuItems,
    setRole,
    setCurrentTable,
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';

  // Config State
  const [selectedTable, setSelectedTable] = useState<string>(initialTable);
  const [isCustomTable, setIsCustomTable] = useState<boolean>(false);
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [targetScope, setTargetScope] = useState<'all' | 'category' | 'item'>(
    initialItemId ? 'item' : initialCategoryId ? 'category' : 'all'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || (menuCategories[0]?.id || ''));
  const [selectedItemId, setSelectedItemId] = useState<string>(initialItemId || (menuItems[0]?.id || ''));
  const [standLanguage, setStandLanguage] = useState<'bilingual' | 'ar' | 'en'>('bilingual');
  const [cardTheme, setCardTheme] = useState<'indigo' | 'dark' | 'clean'>('indigo');
  const [showWifi, setShowWifi] = useState<boolean>(true);
  const [wifiName, setWifiName] = useState<string>(settings.wifiName || 'RoastBloom_Guest');
  const [wifiPassword, setWifiPassword] = useState<string>(settings.wifiPassword || 'CoffeeReward2026');
  const [showLoyaltyPerk, setShowLoyaltyPerk] = useState<boolean>(true);
  const [customCta, setCustomCta] = useState<string>('');

  // Batch Print Mode (e.g. Tables 1..10)
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchCount, setBatchCount] = useState<number>(10);
  const [batchPrefix, setBatchPrefix] = useState<string>(isAr ? 'طاولة' : 'Table');

  // QR Output Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [batchQrUrls, setBatchQrUrls] = useState<{ table: string; url: string; qrDataUrl: string }[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  // Quick Table Presets
  const tablePresets = [
    { id: 'Table 1', labelEn: 'Table 1', labelAr: 'طاولة 1' },
    { id: 'Table 2', labelEn: 'Table 2', labelAr: 'طاولة 2' },
    { id: 'Table 3', labelEn: 'Table 3', labelAr: 'طاولة 3' },
    { id: 'Table 4', labelEn: 'Table 4', labelAr: 'طاولة 4' },
    { id: 'Table 5', labelEn: 'Table 5', labelAr: 'طاولة 5' },
    { id: 'Table 6', labelEn: 'Table 6', labelAr: 'طاولة 6' },
    { id: 'Table 7', labelEn: 'Table 7', labelAr: 'طاولة 7' },
    { id: 'Table 8', labelEn: 'Table 8', labelAr: 'طاولة 8' },
    { id: 'Table 9', labelEn: 'Table 9', labelAr: 'طاولة 9' },
    { id: 'Table 10', labelEn: 'Table 10', labelAr: 'طاولة 10' },
    { id: 'Bar Counter', labelEn: 'Bar Counter', labelAr: 'كاونتر الباريستا' },
    { id: 'Terrace 1', labelEn: 'Terrace 1', labelAr: 'التراس الخارجي 1' },
    { id: 'VIP Lounge', labelEn: 'VIP Lounge', labelAr: 'ركن كبار الشخصيات' },
    { id: 'General Menu', labelEn: 'General (No Table)', labelAr: 'قائمة عامة (بدون طاولة)' },
  ];

  const activeTableName = isCustomTable && customTableInput.trim() ? customTableInput.trim() : selectedTable;

  // Build the target customer URL
  const constructUrlForTable = (tbl: string) => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('view', 'menu');

    if (tbl && tbl !== 'General Menu') {
      params.set('table', tbl);
    }

    if (targetScope === 'category' && selectedCategoryId) {
      params.set('cat', selectedCategoryId);
    } else if (targetScope === 'item' && selectedItemId) {
      params.set('item', selectedItemId);
    }

    return `${base}?${params.toString()}`;
  };

  const currentMenuUrl = constructUrlForTable(activeTableName);

  // Generate Single QR Code
  useEffect(() => {
    if (!isOpen || !currentMenuUrl) return;

    QRCode.toDataURL(currentMenuUrl, {
      margin: 1,
      width: 440,
      errorCorrectionLevel: 'H',
      color: {
        dark: cardTheme === 'dark' ? '#0f172a' : '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [isOpen, currentMenuUrl, cardTheme]);

  // Generate Batch QR Codes if in batch mode
  useEffect(() => {
    if (!isOpen || !batchMode) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateBatch = async () => {
      const results: { table: string; url: string; qrDataUrl: string }[] = [];
      const count = Math.min(Math.max(1, batchCount), 30);

      for (let i = 1; i <= count; i++) {
        const tableLabel = `${batchPrefix} ${i}`;
        const url = constructUrlForTable(tableLabel);
        try {
          const qr = await QRCode.toDataURL(url, {
            margin: 1,
            width: 320,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#1e1b4b',
              light: '#ffffff',
            },
          });
          results.push({ table: tableLabel, url, qrDataUrl: qr });
        } catch (e) {
          console.error(`Failed to generate QR for ${tableLabel}`, e);
        }
      }

      if (isMounted) {
        setBatchQrUrls(results);
        setIsGenerating(false);
      }
    };

    generateBatch();

    return () => {
      isMounted = false;
    };
  }, [isOpen, batchMode, batchCount, batchPrefix, targetScope, selectedCategoryId, selectedItemId]);

  if (!isOpen) return null;

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentMenuUrl);
      setCopied(true);
      triggerToast(
        isAr ? 'تم نسخ رابط القائمة المباشر للطاولة إلى الحافظة!' : 'Table menu URL copied to clipboard!',
        'success'
      );
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Preview as Customer
  const handlePreviewAsCustomer = () => {
    if (activeTableName && activeTableName !== 'General Menu') {
      setCurrentTable(activeTableName);
    }
    setRole('menu');
    onClose();
  };

  // Print Table Tent / Stand Cards
  const handlePrint = () => {
    window.print();
  };

  // Download QR Code PNG
  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    const sanitizedName = (activeTableName || 'menu').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
    link.download = `${settings.shopNameEn || 'Cafe'}_QR_${sanitizedName}.png`;
    link.href = qrDataUrl;
    link.click();

    triggerToast(
      isAr ? 'تم تنزيل رمز QR بنجاح!' : 'QR code downloaded as high-res PNG!',
      'success'
    );
  };

  // Download SVG
  const handleDownloadQrSvg = async () => {
    try {
      const svgString = await QRCode.toString(currentMenuUrl, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = (activeTableName || 'menu').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
      link.download = `${settings.shopNameEn || 'Cafe'}_QR_${sanitizedName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      triggerToast(
        isAr ? 'تم تنزيل ملف SVG المتجه بنجاح!' : 'Scalable vector SVG downloaded!',
        'success'
      );
    } catch (e) {
      console.error('Error generating SVG:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Print-Only Style Sheet for Table Stand / Acrylic Tent */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-table-tent-sheet, #printable-table-tent-sheet * {
            visibility: visible;
          }
          #printable-table-tent-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {isAr ? 'مولّد رموز QR لطاولات المقهى' : 'Table QR Code & Stand Generator'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                  {isAr ? 'متصل بـ Firestore' : 'Live Firestore Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'قم بتوليد وطباعة ستاندات QR لطاولات المقهى ليتصفح الزبائن قائمة المشروبات والمأكولات المباشرة من هواتفهم فوراً.'
                  : 'Generate and print table stands with QR codes so customers can browse your live Firestore menu and prices right from their table.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Layout (Controls on Left/Right, Live Stand Preview) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Mode Switcher: Single Table vs Batch Generator */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBatchMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  !batchMode
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>{isAr ? 'رمز لطاولة محددة' : 'Single Table / Counter'}</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  batchMode
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{isAr ? 'طباعة مجمعة (1 إلى 10+)' : 'Batch Tables Print (1 to 10+)'}</span>
              </button>
            </div>

            {/* Single Table Configuration */}
            {!batchMode ? (
              <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختر الطاولة أو الركن:' : 'Select Table or Station:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTable(!isCustomTable);
                      if (!isCustomTable) setCustomTableInput(selectedTable);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                  >
                    {isCustomTable ? (isAr ? '← اختيار من القائمة' : '← Choose from presets') : (isAr ? '+ اسم طاولة مخصص' : '+ Custom table name')}
                  </button>
                </div>

                {!isCustomTable ? (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {tablePresets.map((preset) => {
                      const isSelected = selectedTable === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedTable(preset.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isAr ? preset.labelAr : preset.labelEn}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={customTableInput}
                      onChange={(e) => setCustomTableInput(e.target.value)}
                      placeholder={isAr ? 'مثال: طاولة 15 أو ركن العائلات 3' : 'e.g. Table 15, Garden Terrace A, Booth 4'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Batch Print Configuration */
              <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isAr ? 'عدد الطاولات المراد توليدها:' : 'Number of Tables:'}
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isAr ? 'بادئة الاسم:' : 'Label Prefix:'}
                    </label>
                    <input
                      type="text"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      placeholder={isAr ? 'طاولة' : 'Table'}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? `سيتم توليد ستاندات من ${batchPrefix} 1 حتى ${batchPrefix} ${batchCount} جاهزة للطباعة فوراً في صفحة واحدة مجمعة.`
                    : `Will generate ${batchCount} printable stands from ${batchPrefix} 1 to ${batchPrefix} ${batchCount} in a unified print sheet.`}
                </p>
              </div>
            )}

            {/* Target Scope: Full Menu vs Specific Category vs Item */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'الوجهة عند مسح الرمز:' : 'QR Code Destination:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: isAr ? 'كامل القائمة' : 'Full Menu' },
                  { id: 'category', label: isAr ? 'قسم محدد' : 'Category' },
                  { id: 'item', label: isAr ? 'صنف مميز' : 'Featured Item' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTargetScope(s.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      targetScope === s.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 border-indigo-300 dark:border-indigo-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {targetScope === 'category' && (
                <div className="pt-2">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {menuCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr || c.nameEn : c.nameEn || c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetScope === 'item' && (
                <div className="pt-2">
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr} ({Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Customization Options: Wi-Fi & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Stand Card Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isAr ? 'نمط وألوان الستاند:' : 'Table Stand Theme:'}
                </label>
                <select
                  value={cardTheme}
                  onChange={(e) => setCardTheme(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="indigo">{isAr ? 'الأزرق النيلي الحديث (Indigo & Cyan)' : 'Modern Indigo & Cyan'}</option>
                  <option value="dark">{isAr ? 'الفخامة الداكنة (Dark Slate & Gold)' : 'Dark Luxury Slate'}</option>
                  <option value="clean">{isAr ? 'الأبيض النقي الاقتصادي للطباعة' : 'Clean Minimalist (Printer-friendly)'}</option>
                </select>
              </div>

              {/* Language Format */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isAr ? 'لغة الستاند:' : 'Card Language:'}
                </label>
                <select
                  value={standLanguage}
                  onChange={(e) => setStandLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="bilingual">{isAr ? 'ثنائي اللغة (عربي + إنجليزي)' : 'Bilingual (Arabic & English)'}</option>
                  <option value="ar">{isAr ? 'عربي فقط' : 'Arabic Only'}</option>
                  <option value="en">{isAr ? 'إنجليزي فقط' : 'English Only'}</option>
                </select>
              </div>
            </div>

            {/* Wi-Fi Details */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isAr ? 'إظهار بيانات الواي فاي على الستاند' : 'Show Wi-Fi Details on Stand'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showWifi}
                  onChange={(e) => setShowWifi(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {showWifi && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isAr ? 'اسم الشبكة (Wi-Fi Name):' : 'Network SSID:'}
                    </label>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      placeholder="Cafe_Guest_Wifi"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isAr ? 'كلمة المرور (Password):' : 'Password:'}
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Direct URL link bar */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-sm">
                {currentMenuUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-200 text-indigo-600 dark:text-cyan-400 text-xs font-bold shadow-xs shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy URL')}</span>
              </button>
            </div>
          </div>

          {/* Preview & Print Column (5 Cols on LG) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">
              {isAr ? 'معاينة ستاند الطاولة المطبوع:' : 'Live Table Stand Preview:'}
            </span>

            {/* Stand Visual Preview Card */}
            <div
              ref={previewCardRef}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-xl border text-center transition-all ${
                cardTheme === 'dark'
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white border-slate-700'
                  : cardTheme === 'clean'
                  ? 'bg-white text-slate-900 border-slate-300'
                  : 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-indigo-500/30'
              }`}
            >
              {/* Stand Header: Brand & Table Number */}
              <div className="space-y-1.5 pb-3 border-b border-white/10">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center text-cyan-300">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black tracking-tight">
                  {isAr ? settings.shopNameAr : settings.shopNameEn}
                </h4>
                <div className="inline-block px-3.5 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wider uppercase">
                  📍 {activeTableName}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="my-4 p-3 bg-white rounded-2xl shadow-inner inline-block mx-auto border-2 border-slate-100">
                {qrDataUrl && qrDataUrl.trim() !== '' ? (
                  <img
                    src={qrDataUrl.trim()}
                    alt="Table Menu QR"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    <QrCode className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Call to action instructions */}
              <div className="space-y-1 text-xs px-2">
                <p className="font-bold text-cyan-300">
                  {standLanguage === 'en'
                    ? 'SCAN FOR DIGITAL MENU'
                    : standLanguage === 'ar'
                    ? 'امسح الرمز لتصفح قائمة المشروبات'
                    : 'SCAN FOR MENU • امسح للقائمة'}
                </p>
                <p className="text-[11px] text-slate-300/80 leading-tight">
                  {standLanguage === 'en'
                    ? 'Browse live drinks, bakery & prices from your phone'
                    : standLanguage === 'ar'
                    ? 'تصفح المشروبات والحلويات والأسعار مباشرة من طاولتك'
                    : 'Live artisan coffee, bakery & prices'}
                </p>
              </div>

              {/* Wi-Fi block */}
              {showWifi && wifiName && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-3 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold">{wifiName}</span>
                  </div>
                  {wifiPassword && (
                    <span className="font-mono text-slate-400">Pass: {wifiPassword}</span>
                  )}
                </div>
              )}

              {/* Loyalty Club bonus note */}
              {showLoyaltyPerk && (
                <div className="mt-2.5 text-[10px] text-amber-300/90 font-medium">
                  ★ {isAr ? 'اجمع الأختام واربح مشروبك القادم مجاناً' : 'Collect stamps & win free drinks'}
                </div>
              )}
            </div>

            {/* Quick action buttons under preview */}
            <div className="w-full max-w-sm space-y-2">
              <button
                type="button"
                id="print-table-tent-btn"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{batchMode ? (isAr ? `طباعة ${batchCount} ستاند دفعة واحدة` : `Print All ${batchCount} Table Stands`) : (isAr ? 'طباعة ستاند الطاولة الآن' : 'Print Table Stand Card')}</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                  title="Download High-Res PNG"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQrSvg}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                  title="Download Vector SVG"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePreviewAsCustomer}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-xs font-bold transition cursor-pointer"
                  title="Test Scan as Customer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تجربة' : 'Test'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {isAr
              ? '💡 نصيحة: يمكنك وضع الرمز داخل ستاند أكريليك شفاف على كل طاولة لسهولة مسحه بكاميرا الهاتف.'
              : '💡 Tip: Insert printed cards into clear acrylic stands or fold into tent cards on each table.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* HIDDEN PRINT SHEET (Rendered only during window.print) */}
      {/* ==================================================== */}
      <div id="printable-table-tent-sheet" className="hidden print:block p-8 bg-white text-slate-950">
        {!batchMode ? (
          /* Single Card Print Layout */
          <div className="max-w-md mx-auto p-8 border-2 border-dashed border-slate-300 rounded-3xl text-center space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{settings.shopNameEn}</h2>
              <p className="text-sm font-bold text-slate-700">{settings.shopNameAr}</p>
            </div>

            <div className="py-2">
              <div className="inline-block px-6 py-2 rounded-2xl bg-slate-900 text-white text-lg font-black tracking-widest uppercase">
                📍 {activeTableName}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl inline-block mx-auto">
              {qrDataUrl && qrDataUrl.trim() !== '' ? (
                <img src={qrDataUrl.trim()} alt="Table Menu QR" className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-300">
                  <Coffee className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {standLanguage === 'en'
                  ? 'SCAN FOR LIVE DIGITAL MENU'
                  : standLanguage === 'ar'
                  ? 'امسح الرمز لتصفح قائمة المشروبات والمأكولات'
                  : 'SCAN FOR MENU • امسح الرمز للقائمة'}
              </h3>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'افتح كاميرا هاتفك وامسح الرمز لتصفح القائمة والأسعار مباشرة'
                  : 'Open your phone camera to view our artisan drinks, bakery & live prices'}
              </p>
            </div>

            {showWifi && wifiName && (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-4 text-xs font-semibold text-slate-700">
                <span>📶 Wi-Fi: <strong>{wifiName}</strong></span>
                {wifiPassword && <span>Password: <strong>{wifiPassword}</strong></span>}
              </div>
            )}

            <div className="text-[11px] text-slate-400 pt-2">
              ★ {settings.sloganEn} • {settings.sloganAr}
            </div>
          </div>
        ) : (
          /* Batch Multi-Card Grid for Tables 1 to N */
          <div className="grid grid-cols-2 gap-6 p-4">
            {batchQrUrls.map((item, idx) => (
              <div
                key={idx}
                className="p-6 border-2 border-slate-300 rounded-3xl text-center space-y-2 page-break-inside-avoid"
              >
                <div className="text-center">
                  <h3 className="text-base font-black text-slate-900">{settings.shopNameEn}</h3>
                  <div className="inline-block px-4 py-1 mt-1 rounded-xl bg-slate-900 text-white text-sm font-black tracking-wider uppercase">
                    📍 {item.table}
                  </div>
                </div>

                <div className="p-2 inline-block mx-auto">
                  {item.qrDataUrl && item.qrDataUrl.trim() !== '' ? (
                    <img src={item.qrDataUrl.trim()} alt={item.table} className="w-36 h-36 object-contain" />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-slate-300">
                      <Coffee className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-900">SCAN FOR MENU • امسح للقائمة</p>

                {showWifi && wifiName && (
                  <p className="text-[10px] text-slate-600 font-mono">
                    📶 {wifiName} {wifiPassword ? `| Pass: ${wifiPassword}` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
