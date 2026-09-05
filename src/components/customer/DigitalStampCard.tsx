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
  Radio,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp, TIER_CONFIGS } from '../../context/AppContext';
import { CardExportService } from '../../services/cardExportService';
import { NFCService } from '../../services/nfcService';
import { CustomerNfcModal } from './CustomerNfcModal';

export const DigitalStampCard: React.FC = () => {
  const { currentCustomer, settings, language, t, triggerToast } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showNfcModal, setShowNfcModal] = useState(false);
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
          background: 'linear-gradient(135deg, #1c130e 0%, #301d14 50%, #150d09 100%)',
          border: '1px solid rgba(217, 119, 6, 0.3)',
        }}
      >
        {/* Decorative Gold Light Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Coffee className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-stone-100">
                {isAr ? settings.shopNameAr : settings.shopNameEn}
              </h3>
            </div>
            <p className="text-xs text-amber-300/80 font-medium">
              {isAr ? 'بطاقة الأختام والمكافآت الرقمية' : 'Digital Stamp Pass'}
            </p>
          </div>

          {/* Tier Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderColor: tierConfig.color,
              color: tierConfig.color,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? tierConfig.nameAr : tierConfig.nameEn}</span>
          </div>
        </div>

        {/* Member Name & Card Number */}
        <div className="relative z-10 flex items-end justify-between mb-6 pb-4 border-b border-stone-800">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block mb-0.5">
              {t('fullName')}
            </span>
            <p className="text-lg font-bold text-stone-100">{currentCustomer.name}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block mb-0.5">
              {isAr ? 'رقم البطاقة' : 'Card #'}
            </span>
            <p className="text-sm font-mono font-extrabold text-amber-400 tracking-wider">
              {currentCustomer.cardNumber}
            </p>
          </div>
        </div>

        {/* Stamps Progress Visual Grid */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-300">
              {t('stampProgress')} ({currentStamps} / {maxStamps})
            </span>
            <span className="text-xs font-bold text-amber-400">
              {stampsRemaining === 0
                ? isAr
                  ? '☕ مشروب مجاني جاهز!'
                  : '☕ Free Drink Ready!'
                : t('stampsRemaining', { count: stampsRemaining })}
            </span>
          </div>

          {/* 8-Grid Stamp Cups */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {Array.from({ length: maxStamps }).map((_, idx) => {
              const isStamped = idx < currentStamps;
              const isTarget = idx === maxStamps - 1;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 aspect-square ${
                    isStamped
                      ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-lg shadow-amber-900/30 scale-102 ring-2 ring-amber-300/40'
                      : isTarget
                      ? 'bg-stone-900/90 border-2 border-dashed border-amber-500/60 text-amber-400'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-500'
                  }`}
                >
                  {isStamped ? (
                    <>
                      <Coffee className="w-6 h-6 text-stone-950 stroke-[2.5]" />
                      <CheckCircle2 className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-stone-950" />
                    </>
                  ) : isTarget ? (
                    <>
                      <Gift className="w-6 h-6 animate-pulse text-amber-400" />
                      <span className="text-[9px] font-extrabold uppercase mt-1 text-amber-300">
                        {isAr ? 'مجاني' : 'FREE'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Coffee className="w-5 h-5 opacity-40" />
                      <span className="text-[10px] font-mono mt-1 font-bold">{idx + 1}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Code and NFC Beam Hub */}
        <div className="relative z-10 p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex flex-col sm:flex-row items-center gap-4">
          {/* QR Code */}
          <div className="shrink-0 bg-white p-2 rounded-xl shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Loyalty QR Code"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-stone-100 text-stone-400">
                <QrCode className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Quick Counter Info */}
          <div className="flex-1 text-center sm:text-left rtl:sm:text-right">
            <p className="text-xs font-semibold text-stone-200 mb-1">
              {t('scanOrNfcAtCounter')}
            </p>
            <p className="text-[11px] text-stone-400 mb-3">
              {isAr
                ? 'أظهر الرمز للباريستا عند الطلب لإضافة الأختام واستبدال الهدايا فورياً.'
                : 'Present this QR code or tap phone to instantly collect coffee stamps.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {/* NFC Transmit Button */}
              <button
                type="button"
                id="customer-nfc-beam-btn"
                onClick={() => setShowNfcModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition active:scale-95 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t('tapToTransmitNfc')}</span>
              </button>

              {/* Download Card Button */}
              <button
                type="button"
                id="customer-download-card-btn"
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? t('savingCard') : t('downloadCard')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Stats summary */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-800/80 text-center">
          <div>
            <span className="text-[10px] text-stone-400 block">{t('pointsBalance')}</span>
            <span className="text-sm font-extrabold text-amber-400">{currentCustomer.totalPoints} pts</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block">{t('totalStampsEarned')}</span>
            <span className="text-sm font-extrabold text-stone-200">
              {currentCustomer.totalStampsCollected} ☕
            </span>
          </div>
        </div>
      </div>

      {/* Customer NFC Modal */}
      <CustomerNfcModal
        isOpen={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        customer={currentCustomer}
      />
    </div>
  );
};
