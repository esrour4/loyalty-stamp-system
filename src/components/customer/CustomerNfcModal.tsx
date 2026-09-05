import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  QrCode,
  Radio,
  Smartphone,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NFCService } from '../../services/nfcService';
import { Customer } from '../../types';

interface CustomerNfcModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export const CustomerNfcModal: React.FC<CustomerNfcModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { language, triggerToast } = useApp();
  const isAr = language === 'ar';

  const [isHardwareSupported, setIsHardwareSupported] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [writeResult, setWriteResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsHardwareSupported(NFCService.isSupported());
      setWriteResult(null);
    }
  }, [isOpen]);

  const handleWriteNfcTag = async () => {
    setIsWriting(true);
    setWriteResult(null);

    const res = await NFCService.writeCustomerCard(customer.cardNumber, customer.name);
    setIsWriting(false);
    setWriteResult(res.message);

    triggerToast(
      isAr
        ? res.success
          ? 'تم بث بيانات البطاقة بنجاح!'
          : res.message
        : res.message,
      res.success ? 'success' : 'warning'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isAr ? 'تقنية NFC وبث البطاقة' : 'NFC Pass & Tap'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {customer.name} • {customer.cardNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Animated visual */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping duration-1000" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Smartphone className="w-8 h-8" />
              </div>
            </div>

            <h4 className="text-sm font-bold">
              {isAr ? 'خيارات مشاركة البطاقة مع الباريستا' : 'Presenting Your Pass to Barista'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs leading-relaxed">
              {isAr
                ? 'يمكنك إظهار رمز QR للباريستا لمسحه فوراً بالكاميرا، أو برمجة بطاقة/ميدالية NFC.'
                : 'Show your QR code on screen for instant camera scanning, or write to physical NFC tags.'}
            </p>
          </div>

          {/* Option 1: QR Code Priority */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <QrCode className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                {isAr ? 'الأسرع: مسح رمز QR من الشاشة' : 'Fastest: Screen QR Code'}
              </p>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                {isAr
                  ? 'بين جهازين جوال، توجيه كاميرا الباريستا نحو رمز QR في بطاقتك هو الخيار الأدق والفوري.'
                  : 'Between two phones, the Barista high-speed camera scanner reads your QR code instantly.'}
              </p>
            </div>
          </div>

          {/* Option 2: Physical NFC Card Write / Broadcast */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-stone-600 dark:text-stone-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? 'كتابة البطاقة على شريحة NFC ملموسة' : 'Write Pass to Physical NFC Tag'}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                  {isAr
                    ? 'برمجة بطاقات NFC البلاستيكية أو الاستيكرات الذكية NTAG213/215 لحملها معك.'
                    : 'Program smart NFC keyfobs, stickers, or physical cards with your loyalty ID.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWriteNfcTag}
              disabled={isWriting}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Radio className={`w-3.5 h-3.5 ${isWriting ? 'animate-spin' : ''}`} />
              <span>
                {isWriting
                  ? isAr
                    ? 'جاري البرمجة/البث...'
                    : 'Writing / Beaming...'
                  : isAr
                  ? 'برمجة بطاقة NFC / بث تجريبي'
                  : 'Write Tag / Broadcast Tap'}
              </span>
            </button>

            {writeResult && (
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 font-mono">
                {writeResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
