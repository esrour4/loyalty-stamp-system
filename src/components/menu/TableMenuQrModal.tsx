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
  Eye,
  Sliders,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';

  // Config State
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

  // QR Output Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  // Construct general digital menu URL
  const currentMenuUrl = (() => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('view', 'menu');

    if (targetScope === 'category' && selectedCategoryId) {
      params.set('cat', selectedCategoryId);
    } else if (targetScope === 'item' && selectedItemId) {
      params.set('item', selectedItemId);
    }

    return `${base}?${params.toString()}`;
  })();

  // Generate QR Code
  useEffect(() => {
    if (!isOpen || !currentMenuUrl) return;

    QRCode.toDataURL(currentMenuUrl, {
      margin: 1,
      width: 440,
      color: {
        dark: cardTheme === 'dark' ? '#0284c7' : '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate menu QR code:', err);
      });
  }, [isOpen, currentMenuUrl, cardTheme]);

  if (!isOpen) return null;

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!currentMenuUrl) return;
    navigator.clipboard.writeText(currentMenuUrl);
    setCopied(true);
    triggerToast(
      isAr ? 'تم نسخ رابط القائمة الرقمية بنجاح!' : 'Menu link copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `cafe-digital-menu-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(
      isAr ? 'تم تحميل صورة QR بنجاح!' : 'QR image downloaded successfully!',
      'success'
    );
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(currentMenuUrl, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cafe-digital-menu-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast(
        isAr ? 'تم تحميل ملف SVG الفيكتور بنجاح!' : 'Vector SVG QR downloaded successfully!',
        'success'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestMenuAsCustomer = () => {
    onClose();
    setRole('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isAr ? 'رمز QR لقائمة المقهى الرقمية' : 'Digital Cafe Menu QR Code'}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  {isAr ? 'قائمة عامة' : 'General Menu'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'توليد وطباعة رمز QR عام لوضعه على الستاندات، الطاولات، الكاونتر، أو مواقع التواصل'
                  : 'Generate & print a general menu QR stand for counters, tables, stickers or social media'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Columns (Settings vs Live Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Target Scope Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {isAr ? 'وجهة رمز QR عند المسح:' : 'QR Destination Scope:'}
              </span>

              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTargetScope('all')}
                  className={`py-2 px-2.5 rounded-xl border transition text-center cursor-pointer ${
                    targetScope === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? 'كافة القائمة' : 'Full Menu'}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetScope('category')}
                  className={`py-2 px-2.5 rounded-xl border transition text-center cursor-pointer ${
                    targetScope === 'category'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? 'قسم محدد' : 'Category'}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetScope('item')}
                  className={`py-2 px-2.5 rounded-xl border transition text-center cursor-pointer ${
                    targetScope === 'item'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? 'صنف معين' : 'Specific Item'}
                </button>
              </div>

              {targetScope === 'category' && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isAr ? 'اختر القسم للفتح المباشر:' : 'Select Category:'}
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  >
                    {menuCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr || c.nameEn : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetScope === 'item' && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isAr ? 'اختر الصنف المميز للفتح المباشر:' : 'Select Menu Item:'}
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  >
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isAr ? item.nameAr || item.nameEn : item.nameEn} ({item.price} {settings.currency || 'SYP'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Stand Language & Theme Style */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {isAr ? 'تخصيص تصميم ولغة الستاند:' : 'Language & Stand Styling:'}
              </span>

              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[
                  { id: 'bilingual', label: isAr ? 'عربي + English' : 'Bilingual' },
                  { id: 'ar', label: 'العربية فقط' },
                  { id: 'en', label: 'English Only' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setStandLanguage(lang.id as any)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] ${
                      standLanguage === lang.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: 'indigo', label: isAr ? 'أزرق عصري' : 'Electric' },
                  { id: 'dark', label: isAr ? 'ليلي فاخر' : 'Luxury Dark' },
                  { id: 'clean', label: isAr ? 'أبيض للطباعة' : 'Clean Print' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setCardTheme(th.id as any)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] font-bold ${
                      cardTheme === th.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Wi-Fi Access Display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isAr ? 'عرض بيانات الواي فاي على الستاند' : 'Show Guest Wi-Fi on Stand'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={showWifi}
                  onChange={(e) => setShowWifi(e.target.checked)}
                  className="rounded-md text-indigo-600"
                />
              </div>

              {showWifi && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      {isAr ? 'اسم الشبكة' : 'Network SSID'}
                    </label>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      placeholder="RoastBloom_Guest"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      {isAr ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                      placeholder="Coffee2026"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Direct URL Share Row */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono truncate text-slate-600 dark:text-slate-400 select-all">
                {currentMenuUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 shrink-0 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Stand Preview & Export Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Live Stand Preview Card */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-100 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div
                ref={previewCardRef}
                className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-xl transition-all duration-300 relative overflow-hidden ${
                  cardTheme === 'indigo'
                    ? 'bg-linear-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white border-2 border-cyan-400/40'
                    : cardTheme === 'dark'
                    ? 'bg-slate-950 text-white border border-slate-800 shadow-2xl'
                    : 'bg-white text-slate-950 border-2 border-slate-300 shadow-lg'
                }`}
              >
                {/* Brand Logo & Name */}
                <div className="space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center text-cyan-300">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black tracking-tight">
                    {isAr ? settings.shopNameAr : settings.shopNameEn}
                  </h4>
                  <p className="text-[11px] text-cyan-300/80">
                    {isAr ? settings.sloganAr : settings.sloganEn}
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="my-4 p-3 bg-white rounded-2xl shadow-inner inline-block mx-auto border-2 border-slate-100">
                  {qrDataUrl && qrDataUrl.trim() !== '' ? (
                    <img
                      src={qrDataUrl.trim()}
                      alt="Digital Cafe Menu QR"
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
                      ? 'SCAN FOR DIGITAL CAFE MENU'
                      : standLanguage === 'ar'
                      ? 'امسح الرمز لتصفح قائمة المقهى'
                      : 'SCAN FOR MENU • امسح الرمز للقائمة'}
                  </p>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    {standLanguage === 'en'
                      ? 'Open your phone camera to explore our specialty coffee, bakery & prices'
                      : standLanguage === 'ar'
                      ? 'افتح كاميرا هاتفك لتصفح المشروبات والأسعار مباشرة'
                      : 'Open camera to browse live menu & prices'}
                  </p>
                </div>

                {/* Wi-Fi Credentials Pill */}
                {showWifi && wifiName && (
                  <div
                    className={`mt-4 p-2.5 rounded-xl text-[11px] font-mono flex items-center justify-center gap-3 ${
                      cardTheme === 'clean'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-white/10 text-cyan-200 border border-white/10'
                    }`}
                  >
                    <span>📶 Wi-Fi: <strong>{wifiName}</strong></span>
                    {wifiPassword && <span>Pass: <strong>{wifiPassword}</strong></span>}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isAr ? 'طباعة الستاند' : 'Print Stand'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحميل PNG' : 'PNG Image'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>{isAr ? 'فيكتور SVG' : 'Vector SVG'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestMenuAsCustomer}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصفح القائمة' : 'Preview Menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* PRINT-ONLY SHEET: FORMATTED FOR STANDS & ACRYLIC TENTS */}
      {/* ==================================================== */}
      <div id="printable-table-tent-sheet" className="hidden print:block p-8 bg-white text-slate-950">
        <div className="max-w-md mx-auto p-8 border-4 border-slate-950 rounded-3xl text-center space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              {settings.shopNameEn}
            </h1>
            <h2 className="text-lg font-bold text-slate-800">{settings.shopNameAr}</h2>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl inline-block mx-auto">
            {qrDataUrl && qrDataUrl.trim() !== '' ? (
              <img src={qrDataUrl.trim()} alt="Digital Cafe Menu QR" className="w-56 h-56 object-contain" />
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
      </div>
    </div>
  );
};

export const GeneralMenuQrModal = TableMenuQrModal;
