import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OwnerLogin: React.FC = () => {
  const { ownerLogin, setRole, language, t, settings } = useApp();
  const [pinInput, setPinInput] = useState('');
  const isAr = language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) return;
    const ok = ownerLogin(pinInput);
    if (!ok) {
      setPinInput('');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
        {/* Brand Icon Header */}
        <div className="relative inline-block mx-auto">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto bg-gradient-to-br from-indigo-600 to-cyan-500"
          >
            <ShieldCheck className="w-8 h-8 text-cyan-200" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {t('ownerLogin')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
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
              className="w-48 mx-auto px-4 py-3.5 text-center tracking-[1em] font-mono text-3xl rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-hidden transition"
            />
          </div>

          <button
            type="submit"
            id="owner-login-submit-btn"
            disabled={pinInput.length < 4}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition active:scale-[0.99] cursor-pointer"
          >
            {isAr ? 'فتح لوحة الإدارة والمالك' : 'Unlock Owner Panel'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition cursor-pointer"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? 'العودة لتطبيق العملاء' : 'Back to Customer App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
