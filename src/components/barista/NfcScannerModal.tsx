import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CreditCard,
  HelpCircle,
  QrCode,
  Radio,
  Sparkles,
  Smartphone,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NFCService } from '../../services/nfcService';
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
  const [activeStopFn, setActiveStopFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      const supported = NFCService.isSupported();
      setIsHardwareSupported(supported);
      setHardwareError(null);

      if (supported) {
        setIsScanning(true);
        NFCService.startReading((cardNum) => {
          const found = customers.find(
            (c) => c.cardNumber.toLowerCase() === cardNum.toLowerCase()
          );
          if (found) {
            triggerToast(
              isAr
                ? `تمت قراءة بطاقة NFC بنجاح: ${found.name}`
                : `NFC Card Detected: ${found.name}`,
              'success'
            );
            onCustomerSelected(found);
            onClose();
          } else {
            triggerToast(
              isAr
                ? `تمت قراءة الرمز (${cardNum}) لكن العميل غير مسجل`
                : `NFC Read: ${cardNum} (Customer not found)`,
              'warning'
            );
          }
        }).then((res) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {isAr ? 'قارئ تقنية NFC' : 'NFC Card & Tag Reader'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isHardwareSupported
                  ? isAr
                    ? 'الاستشعار اللاسلكي نشط'
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
        <div className="p-6 space-y-6">
          {/* NFC Radar Visual Animation */}
          <div className="relative flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-28 h-28">
              {/* Radar waves */}
              <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping duration-1000" />
              <div className="absolute -inset-3 rounded-full bg-amber-500/5 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                <Smartphone className="w-9 h-9" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-4 text-center">
              {isHardwareSupported
                ? isAr
                  ? 'قرّب بطاقة أو شريحة NFC من خلف الجوال'
                  : 'Hold physical NFC card / tag near phone'
                : isAr
                ? 'جاهز للاستقبال والمسح'
                : 'Ready for NFC & QR Pass'}
            </h4>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs text-center leading-relaxed">
              {isHardwareSupported
                ? isAr
                  ? 'يتم الاستماع تلقائياً لبطاقات NTAG وشرائح NFC المبرمجة للمتجر.'
                  : 'Listening automatically for NTAG213/215/216 cards and smart keyfobs.'
                : isAr
                ? 'تقنية Web NFC مقتصرة في المتصفحات على أندرويد كروم والبطاقات الملموسة. يمكنك مسح رمز QR بالكاميرا أو اختيار العميل فورياً أدناه.'
                : 'Web NFC is browser-restricted to Android Chrome with physical tags. Use the Camera QR Scanner or 1-tap customer selection below.'}
            </p>
          </div>

          {/* Quick Camera QR Alternative Button */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {isAr ? 'مسح رمز QR بالكاميرا' : 'Instant Camera QR Scan'}
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  {isAr ? 'يعمل على كافة أجهزة الآيفون والأندرويد' : 'Works on all iOS & Android devices'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrScanner();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              {isAr ? 'فتح الكاميرا' : 'Open Camera'}
            </button>
          </div>

          {/* 1-Tap Quick Customer Tap Simulator */}
          <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
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
