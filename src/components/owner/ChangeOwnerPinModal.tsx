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
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('changeOwnerPinTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('ownerSecurityTitle')}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('changeOwnerPinDesc')}
          </p>

          {/* Current PIN reference */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('currentOwnerPin')}</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {isAr ? 'الرمز الحالي المسجل:' : 'Active PIN:'} <strong className="text-slate-800 dark:text-slate-200">{currentPin}</strong>
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
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden tracking-widest"
            />
          </div>

          {/* New PIN & Confirm New PIN Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                <span>{t('newOwnerPin')}</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateRandomPin}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('generateRandomPin')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
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
                  className="w-full px-3 py-2 text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
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
                  className="w-full px-3 py-2 text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-indigo-100 transition cursor-pointer"
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
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition cursor-pointer"
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
