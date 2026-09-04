import React, { useState } from 'react';
import {
  ShieldCheck,
  Store,
  Lock,
  ArrowRight,
  ArrowLeft,
  Coffee,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OwnerLogin: React.FC = () => {
  const { ownerLogin, setRole, language, t, settings } = useApp();
  const [pinInput, setPinInput] = useState('');
  const isAr = language === 'ar';

  const defaultPin = settings.ownerPin || '1234';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) return;
    const ok = ownerLogin(pinInput);
    if (!ok) {
      setPinInput('');
    }
  };

  const handleQuickDemoFill = () => {
    setPinInput(defaultPin);
    ownerLogin(defaultPin);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-7 sm:p-9 shadow-xl border border-stone-200 dark:border-stone-800 text-center space-y-6">
        {/* Brand Icon Header */}
        <div className="relative inline-block mx-auto">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto"
            style={{ backgroundColor: settings.theme.primary || '#78350f' }}
          >
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
            {t('ownerLogin')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            {t('enterOwnerPinDesc')}
          </p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={4}
              autoFocus
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 4) setPinInput(val);
              }}
              placeholder="••••"
              className="w-48 mx-auto px-4 py-3.5 text-center tracking-[1em] font-mono text-3xl rounded-2xl bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-hidden transition"
            />
          </div>

          <button
            type="submit"
            id="owner-login-submit-btn"
            disabled={pinInput.length < 4}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition active:scale-[0.99] cursor-pointer"
          >
            {isAr ? 'فتح لوحة الإدارة والمالك' : 'Unlock Owner Panel'}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isAr ? `الرمز المعتمد: ${defaultPin}` : `Configured PIN: ${defaultPin}`}</span>
            </div>
            <span className="font-mono font-bold bg-amber-200/80 dark:bg-amber-800/80 px-2 py-0.5 rounded-md text-[11px]">
              {isAr ? 'دخول سريع' : 'Quick Login'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('customer')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? 'العودة لتطبيق العملاء' : 'Back to Customer App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
