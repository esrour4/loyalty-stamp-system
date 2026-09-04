import React, { useState, useEffect } from 'react';
import {
  Coffee,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Store,
  User,
  X,
  Check,
  Calendar,
  Award,
  Sparkles,
} from 'lucide-react';
import { Barista } from '../../types';
import { useApp } from '../../context/AppContext';

interface BaristaEditModalProps {
  isOpen: boolean;
  barista: Barista | null;
  onClose: () => void;
  onSave: (updated: Barista) => void;
}

export const BaristaEditModal: React.FC<BaristaEditModalProps> = ({
  isOpen,
  barista,
  onClose,
  onSave,
}) => {
  const { language, t, triggerToast } = useApp();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [branch, setBranch] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (barista) {
      setName(barista.name || '');
      setPin(barista.pin || '');
      setBranch(barista.branch || '');
      setActive(barista.active !== false);
    }
  }, [barista, isOpen]);

  if (!isOpen || !barista) return null;

  const handleGenerateRandomPin = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    setPin(randomPin);
    triggerToast(
      isAr
        ? `تم توليد رمز PIN جديد (${randomPin})! انقر حفظ للاعتماد.`
        : `Generated new PIN (${randomPin})! Click Save to apply.`,
      'info'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast(isAr ? 'يرجى إدخال اسم الباريستا' : 'Please enter barista name', 'warning');
      return;
    }

    if (!pin.trim() || pin.trim().length !== 4 || !/^\d{4}$/.test(pin.trim())) {
      triggerToast(
        isAr ? 'رمز PIN يجب أن يتكون من 4 أرقام' : 'PIN must be exactly 4 digits',
        'warning'
      );
      return;
    }

    const updated: Barista = {
      ...barista,
      name: name.trim(),
      pin: pin.trim(),
      branch: branch.trim() || 'Main Branch',
      active,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 p-6 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t('editBarista')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {barista.name} • {barista.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>{t('baristaName')}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Faisal Al-Harbi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          {/* Branch Field */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-stone-400" />
              <span>{t('baristaBranch')}</span>
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Downtown Branch, Main Store"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          {/* PIN Edit & Reset Section */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('resetBaristaPin')}</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateRandomPin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-xs transition"
              >
                <Sparkles className="w-3 h-3" />
                <span>{t('generateRandomPin')}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 4) setPin(val);
                }}
                placeholder="4455"
                className="w-36 px-3 py-2 text-center tracking-[0.6em] font-mono text-lg font-bold rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
              <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-snug">
                {isAr
                  ? 'رمز PIN السريع الذي يستخدمه الباريستا لتسجيل الدخول إلى نقطة البيع (الكاونتر).'
                  : 'The 4-digit fast counter access PIN used by the barista to log into POS.'}
              </p>
            </div>
          </div>

          {/* Account Status Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                {t('baristaStatus')}
              </span>
              <span className="text-[11px] text-stone-500">
                {active
                  ? isAr ? 'الحساب نشط ويستطيع تسجيل الدخول' : 'Account is active and can login'
                  : isAr ? 'الحساب معطل ولا يستطيع تسجيل الدخول' : 'Account disabled from counter access'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                active ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  active ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Barista Stats Preview */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">
                {t('stampsIssuedCount')}
              </span>
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                {barista.totalStampsGiven || 0} ☕
              </span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">
                {t('drinksRedeemedCount')}
              </span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {barista.totalRedemptions || 0} 🎁
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{t('saveBaristaChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
