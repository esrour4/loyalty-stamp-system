import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  CheckCircle2,
  Coffee,
  Download,
  Flame,
  Gift,
  QrCode,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp, TIER_CONFIGS } from '../../context/AppContext';
import { CardExportService } from '../../services/cardExportService';

export const DigitalStampCard: React.FC = () => {
  const { currentCustomer, settings, language, t, triggerToast } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    if (currentCustomer?.cardNumber) {
      QRCode.toDataURL(currentCustomer.cardNumber, {
        margin: 1,
        width: 180,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [currentCustomer?.cardNumber]);

  if (!currentCustomer) return null;

  const maxStamps = settings.stampsForFreeDrink || 8;
  const currentStamps = currentCustomer.currentStamps;
  const stampsRemaining = Math.max(0, maxStamps - currentStamps);
  const tierConfig = TIER_CONFIGS[currentCustomer.tier];

  // Handle Download Card as high-res Image
  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      await CardExportService.downloadCardImage(currentCustomer, settings);
      triggerToast(t('cardSavedSuccess'));
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Luxury Digital Card Container */}
      <div
        id="loyalty-card-container"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #164e63 100%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
        }}
      >
        {/* Decorative Cyan & Indigo Light Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Coffee className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-slate-100">
                {isAr ? settings.shopNameAr : settings.shopNameEn}
              </h3>
            </div>
            <p className="text-xs text-cyan-300/90 font-medium">
              {isAr ? 'بطاقة الأختام والمكافآت الرقمية' : 'Digital Stamp Pass'}
            </p>
          </div>

          {/* Tier Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md border"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderColor: tierConfig.color,
              color: tierConfig.color,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? tierConfig.nameAr : tierConfig.nameEn}</span>
          </div>
        </div>

        {/* Member Name & Card Number */}
        <div className="relative z-10 flex items-end justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              {t('fullName')}
            </span>
            <p className="text-lg font-bold text-slate-100">{currentCustomer.name}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
              {isAr ? 'رقم البطاقة' : 'Card #'}
            </span>
            <p className="text-sm font-mono font-extrabold text-cyan-400 tracking-wider">
              {currentCustomer.cardNumber}
            </p>
          </div>
        </div>

        {/* Dynamic Stamp Grid Visual */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('stampProgress')}</span>
            </span>
            <span className="text-xs font-bold text-cyan-300">
              {currentStamps} / {maxStamps} {t('stamps')}
            </span>
          </div>

          {/* Stamp circles grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/20 backdrop-blur-xs">
            {Array.from({ length: maxStamps }).map((_, index) => {
              const isStamped = index < currentStamps;
              const isRewardSlot = index === maxStamps - 1;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-300 ${
                    isStamped
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/30 scale-100'
                      : isRewardSlot
                      ? 'bg-cyan-950/40 border border-dashed border-cyan-400/60 text-cyan-300'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-600'
                  }`}
                >
                  {isStamped ? (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-300">
                      <Coffee className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                      <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-cyan-200" />
                    </div>
                  ) : isRewardSlot ? (
                    <Gift className="w-5 h-5 animate-pulse text-cyan-300" />
                  ) : (
                    <span className="text-xs font-mono font-bold">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Free drink progress encouragement text */}
          <p className="text-center text-xs text-cyan-200/90 mt-2.5 font-medium">
            {stampsRemaining === 0 ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'مبروك! مشروبك القادم مجاناً ☕' : 'Congratulations! Your next coffee is FREE! ☕'}
              </span>
            ) : (
              <span>
                {isAr
                  ? `تبقّى ${stampsRemaining} أختام للحصول على مشروب مجاني!`
                  : `Only ${stampsRemaining} stamps left until your free drink!`}
              </span>
            )}
          </p>
        </div>

        {/* QR Code Presentation Hub */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
          {/* QR Code */}
          <div className="shrink-0 bg-white p-2 rounded-xl shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Loyalty QR Code"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Quick Counter Info */}
          <div className="flex-1 text-center sm:text-left rtl:sm:text-right">
            <p className="text-xs font-semibold text-slate-200 mb-1">
              {isAr ? 'امسح رمز QR عند الكاشير' : 'Scan QR at Counter'}
            </p>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              {isAr
                ? 'أظهر الرمز للباريستا عند الطلب لإضافة الأختام واستبدال المكافآت فورياً.'
                : 'Present this QR code to the barista to collect stamps and redeem rewards.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {/* Download Card Button */}
              <button
                type="button"
                id="customer-download-card-btn"
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? t('savingCard') : t('downloadCard')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Stats summary */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block">{t('pointsBalance')}</span>
            <span className="text-sm font-extrabold text-cyan-400">{currentCustomer.totalPoints} pts</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('totalStampsEarned')}</span>
            <span className="text-sm font-extrabold text-slate-200">
              {currentCustomer.totalStampsCollected} ☕
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
