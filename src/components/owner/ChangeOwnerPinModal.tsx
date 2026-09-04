import React, { useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChangeOwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeOwnerPinModal: React.FC<ChangeOwnerPinModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, language, t, triggerToast } = useApp();
  const isAr = language === 'ar';

  const currentPin = settings.ownerPin || '1234';

  const [enteredCurrentPin, setEnteredCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerateRandomPin = () => {
    const random = String(Math.floor(1000 + Math.random() * 9000));
    setNewPin(random);
    setConfirmPin(random);
    setErrorMsg('');
    triggerToast(
      isAr
        ? `تم توليد رمز PIN جديد (${random})! انقر حفظ لاعتماده.`
        : `Generated new PIN (${random})! Click Save to apply.`,
      'info'
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check entered current pin if provided
    if (enteredCurrentPin.trim() && enteredCurrentPin.trim() !== currentPin.trim()) {
      const err = isAr ? 'رمز PIN الحالي غير صحيح!' : 'Current PIN is incorrect!';
      setErrorMsg(err);
      triggerToast(err, 'warning');
      return;
    }

    // Validate new pin
    if (!newPin.trim() || newPin.trim().length !== 4 || !/^\d{4}$/.test(newPin.trim())) {
      const err = isAr ? 'رمز PIN الجديد يجب أن يكون 4 أرقام بالضبط' : 'New PIN must be exactly 4 digits';
      setErrorMsg(err);
      triggerToast(err, 'warning');
      return;
    }

    // Validate confirmation
    if (newPin.trim() !== confirmPin.trim()) {
      const err = isAr ? 'رمز PIN الجديد وتأكيده غير متطابقين!' : 'New PIN and confirmation do not match!';
      setErrorMsg(err);
      triggerToast(err, 'warning');
      return;
    }

    // Apply update
    updateSettings({ ownerPin: newPin.trim() });
    triggerToast(
      isAr ? 'تم تغيير وتحديث رمز PIN لحساب المالك بنجاح!' : 'Owner account PIN updated successfully!',
      'success'
    );
    
    // Reset and close
    setEnteredCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 p-6 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t('changeOwnerPinTitle')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('ownerSecurityTitle')}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {t('changeOwnerPinDesc')}
          </p>

          {/* Current PIN reference */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('currentOwnerPin')}</span>
              </label>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                {isAr ? 'الرمز الحالي المسجل:' : 'Active PIN:'} <strong className="text-stone-800 dark:text-stone-200">{currentPin}</strong>
              </span>
            </div>
            <input
              type={showPins ? 'text' : 'password'}
              maxLength={4}
              value={enteredCurrentPin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 4) setEnteredCurrentPin(val);
              }}
              placeholder={isAr ? 'أدخل الرمز الحالي للتأكيد (اختياري)' : 'Enter current PIN to confirm (optional)'}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden tracking-widest"
            />
          </div>

          {/* New PIN & Confirm New PIN Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('newOwnerPin')}</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateRandomPin}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('generateRandomPin')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                  {t('newOwnerPin')}
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 4) setNewPin(val);
                    setErrorMsg('');
                  }}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                  {t('confirmNewOwnerPin')}
                </label>
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 4) setConfirmPin(val);
                    setErrorMsg('');
                  }}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 transition cursor-pointer"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPins ? (isAr ? 'إخفاء الأرقام' : 'Hide digits') : (isAr ? 'إظهار الأرقام' : 'Show digits')}</span>
              </button>

              {newPin && confirmPin && newPin === confirmPin && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{isAr ? 'الرموز متطابقة' : 'Pins match'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('saveNewPin')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
