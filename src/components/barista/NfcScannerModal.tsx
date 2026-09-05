import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CreditCard,
  HelpCircle,
  Info,
  QrCode,
  Radio,
  Sparkles,
  Smartphone,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NFCService, NfcReadResult } from '../../services/nfcService';
import { Customer } from '../../types';

interface NfcScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelected: (customer: Customer) => void;
  onOpenQrScanner: () => void;
}

export const NfcScannerModal: React.FC<NfcScannerModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelected,
  onOpenQrScanner,
}) => {
  const { customers, language, t, triggerToast } = useApp();
  const isAr = language === 'ar';

  const [isHardwareSupported, setIsHardwareSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const [lastScannedUid, setLastScannedUid] = useState<string | null>(null);
  const [activeStopFn, setActiveStopFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      const supported = NFCService.isSupported();
      setIsHardwareSupported(supported);
      setHardwareError(null);
      setLastScannedUid(null);

      if (supported) {
        setIsScanning(true);
        NFCService.startReading(
          (cardNum, readResult: NfcReadResult) => {
            if (readResult.serialNumber) {
              setLastScannedUid(readResult.serialNumber);
            }

            // 1. Match by card number or extracted ID
            let found = customers.find(
              (c) =>
                c.cardNumber.toLowerCase() === cardNum.toLowerCase() ||
                (c.nfcTagUid &&
                  readResult.serialNumber &&
                  c.nfcTagUid.toLowerCase() === readResult.serialNumber.toLowerCase())
            );

            // 2. Match by phone or ID
            if (!found) {
              found = customers.find(
                (c) => c.phone.includes(cardNum) || c.id === cardNum
              );
            }

            if (found) {
              triggerToast(
                isAr
                  ? `تمت قراءة بطاقة NFC بنجاح: ${found.name} ${
                      readResult.serialNumber ? `(UID: ${readResult.serialNumber})` : ''
                    }`
                  : `NFC Card Detected: ${found.name} ${
                      readResult.serialNumber ? `(UID: ${readResult.serialNumber})` : ''
                    }`,
                'success'
              );
              onCustomerSelected(found);
              onClose();
            } else {
              triggerToast(
                isAr
                  ? `تمت قراءة شريحة (${cardNum}) ولكن لم يتم العثور على عميل مسجل بها.`
                  : `NFC Read: "${cardNum}" (No registered customer found)`,
                'warning'
              );
            }
          },
          (serial) => {
            if (serial) setLastScannedUid(serial);
          }
        ).then((res) => {
          if (res.success && res.stop) {
            setActiveStopFn(() => res.stop);
          } else if (res.error) {
            setHardwareError(res.error);
            setIsScanning(false);
          }
        });
      }

      // Also listen to cross-tab BroadcastChannel for quick simulation
      let bc: BroadcastChannel | null = null;
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          bc = new BroadcastChannel('coffee_nfc_channel');
          bc.onmessage = (event) => {
            const cardNum = event.data?.cardNumber;
            if (cardNum) {
              const found = customers.find(
                (c) => c.cardNumber.toLowerCase() === cardNum.toLowerCase()
              );
              if (found) {
                triggerToast(
                  isAr
                    ? `تم استقبال نقرة NFC للعميل: ${found.name}`
                    : `Received NFC Tap: ${found.name}`,
                  'success'
                );
                onCustomerSelected(found);
                onClose();
              }
            }
          };
        }
      } catch (e) {
        // ignore
      }

      return () => {
        if (activeStopFn) {
          activeStopFn();
        }
        if (bc) {
          bc.close();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateTap = (customer: Customer) => {
    triggerToast(
      isAr
        ? `تمت محاكاة نقرة NFC لبطاقة: ${customer.name}`
        : `Simulated NFC Tap: ${customer.name}`,
      'success'
    );
    onCustomerSelected(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isAr ? 'قارئ تقنية NFC والبطاقات' : 'NFC Card & Tag Reader'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isHardwareSupported
                  ? isAr
                    ? 'المستشعر اللاسلكي نشط (Web NFC)'
                    : 'Hardware Web NFC Active'
                  : isAr
                  ? 'وضع المحاكاة والمسح'
                  : 'NFC Emulation & Scanning'}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* NFC Radar Visual Animation */}
          <div className="relative flex flex-col items-center justify-center py-4 text-center">
            <div className="relative flex items-center justify-center w-28 h-28">
              {/* Radar waves */}
              <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping duration-1000" />
              <div className="absolute -inset-3 rounded-full bg-amber-500/10 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                <Smartphone className="w-9 h-9" />
              </div>
            </div>

            <h4 className="text-sm font-bold mt-4">
              {isHardwareSupported
                ? isAr
                  ? 'قرّب بطاقة أو ميدالية NFC من خلف الجوال'
                  : 'Hold physical NFC card / tag near phone'
                : isAr
                ? 'جاهز للاستقبال والمسح'
                : 'Ready for NFC & QR Pass'}
            </h4>

            {lastScannedUid && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                Tag UID: {lastScannedUid}
              </span>
            )}

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs leading-relaxed">
              {isHardwareSupported
                ? isAr
                  ? 'يتم الاستماع تلقائياً لبطاقات NTAG وشرائح NFC المبرمجة للمتجر.'
                  : 'Listening automatically for NTAG213/215/216 cards and smart keyfobs.'
                : isAr
                ? 'تقنية Web NFC مقتصرة في المتصفحات على أندرويد كروم والبطاقات الملموسة. يمكنك مسح رمز QR بالكاميرا أو اختيار العميل فورياً أدناه.'
                : 'Web NFC is browser-restricted to Android Chrome with physical tags. Use the Camera QR Scanner or 1-tap customer selection below.'}
            </p>
          </div>

          {/* Educational Phone-to-Phone Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950 dark:text-amber-200">
                {isAr
                  ? 'لمس الهاتف بالهاتف يهتز بدون نقل البيانات؟'
                  : 'Touching Phone-to-Phone Vibrates Without Data?'}
              </p>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                {isAr
                  ? 'اهتزاز الهاتف عند لمس جوال آخر هو استشعار تلقائي من نظام أندرويد، ولكن متصفحات الويب لا تدعم البث المباشر بين هاتفين. لنقل البيانات فورياً بين هاتفين، استخدم كاميرا QR أدناه.'
                  : 'Phone vibration upon touching another phone is a hardware OS collision. Web browsers require physical NFC tags/cards to read data. For phone-to-phone, use the Instant Camera Scanner.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQrScanner();
                }}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح ماسح كاميرا QR الفوري' : 'Switch to Camera QR Scanner'}</span>
              </button>
            </div>
          </div>

          {/* 1-Tap Quick Customer Tap Simulator */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'محاكاة نقرة بطاقة العميل (تجربة فورية):' : 'Instant 1-Tap Card Simulation:'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {customers.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSimulateTap(c)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700/70 text-left rtl:text-right transition cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {c.name}
                    </p>
                    <p className="text-[10px] font-mono text-stone-500 truncate">
                      {c.cardNumber}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                    {c.currentStamps}/8 ☕
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
