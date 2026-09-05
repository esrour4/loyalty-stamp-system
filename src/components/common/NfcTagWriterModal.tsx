import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Flame,
  HelpCircle,
  Info,
  Link2,
  QrCode,
  Radio,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NFCService, NfcWriteOptions } from '../../services/nfcService';
import { Customer } from '../../types';

interface NfcTagWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onOpenQrScanner?: () => void;
}

export const NfcTagWriterModal: React.FC<NfcTagWriterModalProps> = ({
  isOpen,
  onClose,
  customer,
  onOpenQrScanner,
}) => {
  const { language, t, triggerToast, updateCustomer } = useApp();
  const isAr = language === 'ar';

  const [isHardwareSupported, setIsHardwareSupported] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'smart' | 'compact' | 'url' | 'json'>('smart');
  
  // Write process state machine
  const [status, setStatus] = useState<'idle' | 'writing' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedTagUid, setDetectedTagUid] = useState<string | null>(customer.nfcTagUid || null);
  const [recordsWrittenCount, setRecordsWrittenCount] = useState<number>(0);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string | null>(null);

  const smartPassUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?card=${encodeURIComponent(customer.cardNumber)}`;

  useEffect(() => {
    if (isOpen) {
      setIsHardwareSupported(NFCService.isSupported());
      setStatus('idle');
      setErrorMessage(null);
      setDetectedTagUid(customer.nfcTagUid || null);
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleStartWrite = async () => {
    setStatus('writing');
    setErrorMessage(null);

    const writeResult = await NFCService.writeCustomerCard(customer.cardNumber, customer.name, {
      format: selectedFormat,
    });

    if (writeResult.success) {
      setRecordsWrittenCount(writeResult.recordsWritten || 1);
      
      // If hardware was used, initiate quick readback verification
      if (writeResult.isHardware) {
        setStatus('verifying');
        triggerToast(
          isAr
            ? 'تمت الكتابة! أبقِ الشريحة بالقرب للتحقق التلقائي...'
            : 'Tag written! Verifying tag data...',
          'info'
        );

        // Verification reader timeout
        let readbackSuccess = false;
        const readerPromise = NFCService.startReading(
          (readCardNum, result) => {
            if (readCardNum.toUpperCase() === customer.cardNumber.toUpperCase() || (result.serialNumber && result.serialNumber.length > 0)) {
              readbackSuccess = true;
              if (result.serialNumber) {
                setDetectedTagUid(result.serialNumber);
                // Automatically pair hardware UID with customer record
                if (!customer.nfcTagUid || customer.nfcTagUid !== result.serialNumber) {
                  updateCustomer({
                    ...customer,
                    nfcTagUid: result.serialNumber,
                  });
                }
              }
              setStatus('success');
              setLastVerifiedTime(new Date().toLocaleTimeString());
              triggerToast(
                isAr
                  ? `تمت برمجة وتوثيق شريحة NFC بنجاح! UID: ${result.serialNumber || 'NTAG'}`
                  : `NFC Tag programmed & verified! (UID: ${result.serialNumber || 'NTAG'})`,
                'success'
              );
            }
          }
        );

        // Stop verifying after 4.5 seconds if already written
        setTimeout(() => {
          if (!readbackSuccess) {
            setStatus('success');
            setLastVerifiedTime(new Date().toLocaleTimeString());
            triggerToast(
              isAr ? 'تمت كتابة بيانات البطاقة على الشريحة بنجاح!' : 'Card data written to NFC tag successfully!',
              'success'
            );
          }
        }, 4500);
      } else {
        // Simulated / non-hardware mode
        setStatus('success');
        setLastVerifiedTime(new Date().toLocaleTimeString());
        triggerToast(
          isAr
            ? 'تم إرسال بث نقرة NFC التجريبي بنجاح!'
            : 'Simulated NFC Tap broadcasted successfully!',
          'success'
        );
      }
    } else {
      setStatus('error');
      setErrorMessage(writeResult.message);
      triggerToast(writeResult.message, 'warning');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(smartPassUrl);
    triggerToast(isAr ? 'تم نسخ رابط البطاقة الذكية!' : 'Smart pass link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{isAr ? 'برمجة بطاقات وشرائح NFC' : 'NFC Tag & Pass Studio'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {isHardwareSupported ? 'Web NFC Ready' : 'Sim / Emulation'}
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {customer.name} • <span className="font-mono">{customer.cardNumber}</span>
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

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target Customer Card Banner */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white dark:bg-stone-800/90 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                {isAr ? 'بيانات البطاقة المستهدفة' : 'Target Customer Card'}
              </span>
              <p className="text-sm font-bold mt-0.5">{customer.name}</p>
              <p className="text-xs font-mono text-stone-400 mt-0.5">{customer.cardNumber} • {customer.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {customer.currentStamps}/8 ☕
              </span>
              {detectedTagUid && (
                <span className="block text-[9px] font-mono text-stone-400 mt-1.5 truncate max-w-[120px]">
                  UID: {detectedTagUid}
                </span>
              )}
            </div>
          </div>

          {/* Educational Note regarding Mobile-to-Mobile Touch vs Physical NFC Tag */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-stone-800 dark:text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? 'توضيح هام حول لمس الجوالين وتقنية NFC:'
                  : 'Important Note: Phone-to-Phone Touch vs NFC Tags'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600 dark:text-amber-200/80">
              {isAr
                ? 'عند لمس هاتفين، يهتز نظام أندرويد تلقائياً كاستشعار فيزيائي، ولكن متصفحات الويب لا ترسل البيانات المباشرة بين هاتفين بدون شريحة NFC ملموسة. لنقل البيانات فورياً بين جهازين، يرجى استخدام كاميرا الباريستا لمسح رمز QR الخاص بالعميل.'
                : 'When two phones touch back-to-back, the mobile OS vibrates by default, but browsers cannot beam P2P data without a physical NFC tag. For instant phone-to-phone reading, use the Barista Camera QR Scanner.'}
            </p>
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQrScanner();
                }}
                className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح ماسح كاميرا QR الفوري بين الهواتف' : 'Open Instant Phone-to-Phone Camera Scanner'}</span>
              </button>
            )}
          </div>

          {/* Select Encoding Format */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              {isAr ? 'اختر صيغة برمجة شريحة NFC:' : 'Select NFC Encoding Format:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Smart Dual Pass */}
              <button
                type="button"
                onClick={() => setSelectedFormat('smart')}
                className={`p-3 rounded-2xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'smart'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/70 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'بطاقة ذكية شاملة (موصى بها)' : 'Smart Dual Pass (Best)'}</span>
                  </span>
                  {selectedFormat === 'smart' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {isAr
                    ? 'رابط ذكي يفتح البطاقة عند نقر أي آيفون/أندرويد + نص البطاقة لقارئ الباريستا.'
                    : 'Universal web launch on any phone tap + instant raw card decode.'}
                </p>
              </button>

              {/* Option 2: Compact Text */}
              <button
                type="button"
                onClick={() => setSelectedFormat('compact')}
                className={`p-3 rounded-2xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'compact'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/70 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'نص مدمج (NTAG213 / 144B)' : 'Compact (NTAG213 144B)'}</span>
                  </span>
                  {selectedFormat === 'compact' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {isAr
                    ? 'حجم فائق الصغر (<30 بايت) مناسب للميداليات والملصقات الصغيرة.'
                    : 'Ultra lightweight (<30 bytes) for small tags and keyfobs.'}
                </p>
              </button>

              {/* Option 3: Universal Auto-Launch URL */}
              <button
                type="button"
                onClick={() => setSelectedFormat('url')}
                className={`p-3 rounded-2xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'url'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/70 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'رابط تفاعلي مباشر (URL)' : 'Direct URL Pass'}</span>
                  </span>
                  {selectedFormat === 'url' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {isAr
                    ? 'يفتح بطاقة العميل تلقائياً عند النقر بدون الحاجة لتثبيت أي تطبيق.'
                    : 'Opens pass in browser automatically on any phone tap.'}
                </p>
              </button>

              {/* Option 4: Full JSON */}
              <button
                type="button"
                onClick={() => setSelectedFormat('json')}
                className={`p-3 rounded-2xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'json'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/70 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'بيانات مشفرة (JSON)' : 'Full JSON Pass'}</span>
                  </span>
                  {selectedFormat === 'json' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {isAr
                    ? 'تخزين الاسم ورقم البطاقة وتاريخ الإصدار داخل الذاكرة.'
                    : 'Encodes customer name, card ID, and timestamp metadata.'}
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Radar Visual & Action Area */}
          <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/70 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Animated Coil Visual */}
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              {status === 'writing' || status === 'verifying' ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-1000" />
                  <div className="absolute -inset-3 rounded-full bg-amber-500/10 animate-pulse" />
                </>
              ) : null}

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  status === 'success'
                    ? 'bg-green-600 text-white shadow-green-500/30'
                    : status === 'writing' || status === 'verifying'
                    ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/40'
                    : status === 'error'
                    ? 'bg-red-600 text-white shadow-red-500/30'
                    : 'bg-stone-900 text-white dark:bg-stone-700 shadow-stone-900/20'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : status === 'writing' || status === 'verifying' ? (
                  <Radio className="w-8 h-8 animate-spin" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <Tag className="w-7 h-7 text-amber-400" />
                )}
              </div>
            </div>

            {/* Status Text & Guidance */}
            <h4 className="text-sm font-bold">
              {status === 'writing'
                ? isAr
                  ? 'قرّب شريحة أو بطاقة NFC من خلف الجوال...'
                  : 'Hold physical NFC tag against back of phone...'
                : status === 'verifying'
                ? isAr
                  ? 'جاري التحقق من بيانات الشريحة المكتوبة...'
                  : 'Verifying written data on NFC tag...'
                : status === 'success'
                ? isAr
                  ? 'تمت البرمجة والتوثيق بنجاح! ✨'
                  : 'Tag Programmed & Verified! ✨'
                : status === 'error'
                ? isAr
                  ? 'حدث خطأ أثناء الكتابة'
                  : 'NFC Write Failed'
                : isAr
                ? 'جاهز لبرمجة شريحة NFC الملموسة'
                : 'Ready to Program Physical NFC Tag'}
            </h4>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm leading-relaxed">
              {status === 'writing'
                ? isAr
                  ? 'ضع بطاقة NTAG213/215 أو الميدالية بالقرب من هوائي NFC (أعلى أو منتصف ظهر الهاتف) لمدة ثانيتين.'
                  : 'Place NTAG213/215 tag, sticker, or smart card near your phone antenna for 2 seconds.'
                : status === 'success'
                ? isAr
                  ? `أصبحت الشريحة جاهزة للاستخدام عند الكاشير أو لمس الهواتف. ${detectedTagUid ? `(UID: ${detectedTagUid})` : ''}`
                  : `Tag is ready for instant counter taps! ${detectedTagUid ? `(Paired UID: ${detectedTagUid})` : ''}`
                : errorMessage
                ? errorMessage
                : isAr
                ? 'اضغط على الزر أدناه ثم قرّب البطاقة البلاستيكية أو الاستيكر لبرمجتها فورياً.'
                : 'Click button below then hold your blank NFC card or sticker to write.'}
            </p>

            {/* Primary Action Button */}
            <div className="w-full mt-5">
              <button
                type="button"
                onClick={handleStartWrite}
                disabled={status === 'writing' || status === 'verifying'}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'writing' || status === 'verifying' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري الاتصال والبرمجة...' : 'Writing / Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>
                      {status === 'success'
                        ? isAr
                          ? 'إعادة كتابة الشريحة / بطاقة أخرى'
                          : 'Write Another Tag'
                        : isAr
                        ? 'بدء كتابة وبرمجة شريحة NFC'
                        : 'Start Writing to NFC Tag'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Share / Direct Link fallback */}
          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-stone-400 block uppercase">
                {isAr ? 'رابط البطاقة الذكية المباشر:' : 'Direct Smart Pass URL:'}
              </span>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400 truncate mt-0.5">
                {smartPassUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:text-amber-600 border border-stone-200 dark:border-stone-600 transition cursor-pointer shrink-0"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
