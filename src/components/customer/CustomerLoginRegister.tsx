import React, { useState, useEffect } from 'react';
import { Coffee, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerLoginRegister: React.FC = () => {
  const {
    loginCustomerByCard,
    registerCustomer,
    t,
    language,
    settings,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [cardNumberInput, setCardNumberInput] = useState('');
  
  // Registration form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');

  const isAr = language === 'ar';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const card = params.get('card') || params.get('login') || params.get('c');
      const ref = params.get('ref');
      if (card) {
        setCardNumberInput(card);
        loginCustomerByCard(card);
      } else if (ref) {
        setReferralCode(ref);
        setMode('register');
      }
    } catch (e) {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cardNumberInput.trim()) {
      setError(isAr ? 'يرجى إدخال رقم البطاقة أو رقم الجوال' : 'Please enter card or phone number');
      return;
    }
    const res = loginCustomerByCard(cardNumberInput);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError(isAr ? 'يرجى إدخال الاسم ورقم الجوال' : 'Please provide full name and phone');
      return;
    }
    registerCustomer(name, phone, dob, referralCode);
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-xl"
          style={{ backgroundColor: settings.theme.primary || '#78350f' }}
        >
          <Coffee className="w-8 h-8 text-amber-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          {isAr ? settings.shopNameAr : settings.shopNameEn}
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {isAr ? 'برنامج مكافآت الأختام الرقمية • اجمع الأختام واشرب مجاناً' : 'Digital Coffee Stamps • Collect & Sip Free'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 dark:border-stone-800">
        {/* Toggle Mode Tabs */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            {t('loginWithCard')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            {t('registerTitle')}
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('enterCardNumber')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="customer-login-card-input"
                  value={cardNumberInput}
                  onChange={(e) => setCardNumberInput(e.target.value)}
                  placeholder={isAr ? 'رقم البطاقة أو رقم الجوال' : 'Card number or phone number'}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="customer-login-submit-btn"
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: settings.theme.accent || '#d97706' }}
            >
              <Coffee className="w-4 h-4" />
              <span>{t('loginBtn')}</span>
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                id="register-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? 'مثال: ريم الشامي' : 'e.g. Maya Al-Halabi'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('phone')} *
              </label>
              <input
                type="tel"
                id="register-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+963 933 123 456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('dob')} 🎂
              </label>
              <input
                type="date"
                id="register-dob-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-stone-400 mt-0.5">
                {isAr ? 'نرسل لك مشروباً مجانياً وهدية في شهر ميلادك!' : 'We send a free specialty beverage on your birthday!'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('referralCodeOptional')} 🎁
              </label>
              <input
                type="text"
                id="register-referral-input"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. SARA99"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              id="customer-register-submit-btn"
              className="w-full mt-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: settings.theme.accent || '#d97706' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('joinBtn')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
