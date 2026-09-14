import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Coffee,
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Sparkles,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'customer' | 'barista' | 'owner';
}

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'customer',
}) => {
  const {
    setRole,
    loginCustomerByCard,
    registerCustomer,
    baristaLogin,
    ownerLogin,
    language,
    t,
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'customer' | 'barista' | 'owner'>(defaultTab);

  // Customer state
  const [customerInput, setCustomerInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regRef, setRegRef] = useState('');

  // Barista PIN state
  const [baristaPin, setBaristaPin] = useState('');

  // Owner PIN state
  const [ownerPin, setOwnerPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Handle Customer Sign-In
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!customerInput.trim()) return;

    const res = loginCustomerByCard(customerInput.trim());
    if (res.success) {
      setRole('customer');
      onClose();
      triggerToast(isAr ? `أهلاً بك مجدداً يا ${res.customer?.name}!` : `Welcome back, ${res.customer?.name}!`, 'success');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Customer Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim() || !regPhone.trim()) return;

    const res = registerCustomer(regName.trim(), regPhone.trim(), regDob, regRef);
    if (res.success) {
      setRole('customer');
      onClose();
      triggerToast(isAr ? 'تم إنشاء بطاقتك الرقمية بنجاح!' : 'Digital card created successfully!', 'success');
    }
  };

  // Handle Barista PIN
  const handleBaristaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!baristaPin.trim()) return;

    const success = baristaLogin(baristaPin.trim());
    if (success) {
      setRole('barista');
      onClose();
      triggerToast(isAr ? 'تم تسجيل الدخول لكاونتر الباريستا بنجاح' : 'Barista POS unlocked successfully', 'success');
    } else {
      setErrorMessage(isAr ? 'رمز PIN غير صحيح.' : 'Invalid PIN.');
    }
  };

  // Handle Owner PIN
  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!ownerPin.trim()) return;

    const success = ownerLogin(ownerPin.trim());
    if (success) {
      setRole('owner');
      onClose();
      triggerToast(isAr ? 'تم تسجيل الدخول للوحة المالك والإدارة بنجاح' : 'Owner Dashboard unlocked successfully', 'success');
    } else {
      setErrorMessage(isAr ? 'رمز PIN غير صحيح.' : 'Invalid Owner PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all">
        
        {/* Top Header Banner with Fresh Vibrant Gradient */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                {isAr ? 'تسجيل الدخول للنظام' : 'Access Portal & Rewards'}
              </h3>
              <p className="text-xs text-indigo-100">
                {isAr ? 'اختر بوابتك للدخول الفوري ومتابعة أختامك' : 'Choose your destination to sign in seamlessly'}
              </p>
            </div>
          </div>

          {/* 3-Role Switcher Tabs */}
          <div className="flex p-1 bg-black/20 rounded-2xl mt-4 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAr ? 'بطاقة العميل' : 'Customer'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('barista');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'barista'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{isAr ? 'الباريستا' : 'Barista'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('owner');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'owner'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isAr ? 'الإدارة' : 'Owner'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: CUSTOMER ACCESS */}
          {activeTab === 'customer' && (
            <div className="space-y-4">
              {!isRegistering ? (
                <>
                  <form onSubmit={handleCustomerSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isAr ? 'رقم البطاقة أو رقم الجوال' : 'Card Number or Phone'}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInput}
                        onChange={(e) => setCustomerInput(e.target.value)}
                        placeholder={isAr ? 'مثال: 100101 أو +963...' : 'e.g. 100101 or phone'}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-semibold outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>{isAr ? 'الدخول إلى بطاقتي' : 'Access My Rewards Pass'}</span>
                      <Arrow className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Register Switcher */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setErrorMessage('');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition cursor-pointer"
                    >
                      {isAr ? 'عضو جديد؟ اضغط هنا للانضمام بـ 10 ثوانٍ' : 'New coffee lover? Click here to join in 10s'}
                    </button>
                  </div>
                </>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={isAr ? 'ريم الشامي' : 'Maya Adams'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'رقم الجوال (واتساب)' : 'Mobile Phone (WhatsApp)'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+963 944 112 233"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'الميلاد (لهدية سنوية)' : 'Birthday (for gift)'}
                      </label>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'رمز دعوة (اختياري)' : 'Referral Code'}
                      </label>
                      <input
                        type="text"
                        value={regRef}
                        onChange={(e) => setRegRef(e.target.value)}
                        placeholder="SARA99"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-hidden uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>{isAr ? 'إنشاء بطاقتي الرقمية فوراً' : 'Create My Digital Card'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 transition cursor-pointer"
                    >
                      {isAr ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already registered? Sign in'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: BARISTA ACCESS */}
          {activeTab === 'barista' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  {isAr
                    ? 'كاونتر ونقاط بيع الباريستا لإصدار الأختام، مسح NFC و QR، وصرف وتبديل الهدايا.'
                    : 'Barista POS counter to stamp cards, scan QR/NFC, and redeem or replace rewards.'}
                </span>
              </div>

              <form onSubmit={handleBaristaSubmit} className="space-y-4 text-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? 'أدخل رمز PIN للباريستا' : 'Enter 4-Digit Barista PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={baristaPin}
                    onChange={(e) => setBaristaPin(e.target.value)}
                    placeholder="••••"
                    className="w-36 mx-auto px-4 py-3 text-center tracking-[0.8em] font-mono text-2xl rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Coffee className="w-4 h-4" />
                  <span>{isAr ? 'دخول كاونتر الباريستا' : 'Unlock Barista Counter'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: OWNER ACCESS */}
          {activeTab === 'owner' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  {isAr
                    ? 'لوحة إدارة المتجر: تحليلات المبيعات، إدارة الكتالوج والأسعار، وإرسال حملات الواتساب.'
                    : 'Owner dashboard: sales analytics, reward items, staff management, and CRM broadcasts.'}
                </span>
              </div>

              <form onSubmit={handleOwnerSubmit} className="space-y-4 text-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? 'أدخل رمز PIN للمالك' : 'Enter 4-Digit Owner PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    placeholder="••••"
                    className="w-36 mx-auto px-4 py-3 text-center tracking-[0.8em] font-mono text-2xl rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Store className="w-4 h-4" />
                  <span>{isAr ? 'دخول لوحة الإدارة' : 'Unlock Owner Dashboard'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
