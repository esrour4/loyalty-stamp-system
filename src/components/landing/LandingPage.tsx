import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Flame,
  Gift,
  KeyRound,
  LogIn,
  MessageSquare,
  QrCode,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { QuickLoginModal } from './QuickLoginModal';
import { UserRole } from '../../types';

interface LandingPageProps {
  onNavigateToLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin: _onNavigateToLogin }) => {
  const {
    settings,
    language,
    t,
  } = useApp();

  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'customer' | 'barista' | 'owner'>('customer');

  // Interactive Live Card Simulation State
  const [simulatedStamps, setSimulatedStamps] = useState(7);
  const [stampFeedback, setStampFeedback] = useState<string | null>(null);

  // FAQ expanded state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Trigger celebration confetti when 8th stamp is clicked
  const handleSimulateStamp = () => {
    if (simulatedStamps < 8) {
      const next = simulatedStamps + 1;
      setSimulatedStamps(next);
      if (next === 8) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
        setStampFeedback(isAr ? '🎉 مبروك! حصلت على كوب مشروب مجاني!' : '🎉 Congratulations! Free Specialty Drink Unlocked!');
      } else {
        setStampFeedback(isAr ? 'تم إضافة ختم تجريبي بنجاح!' : 'Stamp added successfully!');
      }
    } else {
      setSimulatedStamps(1);
      setStampFeedback(isAr ? 'تم بدء دورة أختام جديدة' : 'Started a fresh stamp cycle');
    }

    setTimeout(() => setStampFeedback(null), 3500);
  };

  const openLogin = (tab: 'customer' | 'barista' | 'owner' = 'customer') => {
    setModalTab(tab);
    setIsLoginModalOpen(true);
  };

  const faqs = isAr
    ? [
        {
          q: 'كيف يعمل ختم البطاقة عبر NFC و QR؟',
          a: 'يمكن للعميل بمجرد فتح بطاقته الرقمية على هاتفه تمريرها قرب جهاز الباريستا بفضل تقنية NFC أو إظهار رمز الـ QR لمسحه خلال ثانيتين فقط.',
        },
        {
          q: 'ماذا يحدث عند جمع 8 أختام؟',
          a: 'يتحول الختم الثامن تلقائياً إلى قسيمة مشروب مجاني تظهر للباريستا لصرفها فوراً، ويمكنك أيضاً استبدال أختامك بهدايا من الكتالوج.',
        },
        {
          q: 'كيف يعمل استبدال الأختام من كتالوج المكافآت؟',
          a: 'يمكنك اختيار أي صنف أو مخبوزات أو محاصيل بن من كتالوج المكافآت، وسيتم خصم عدد الأختام المطلوبة من بطاقتك مباشرة لدى الباريستا.',
        },
        {
          q: 'كيف تصلني رسائل الواتساب والبطاقة؟',
          a: 'عند التسجيل، يرسل النظام رسالة تترحيبية آلية إلى رقم واتسابك تحتوي على رابط مباشر لبطاقتك الرقمية لتتمكن من حفظها واستخدامها دائماً.',
        },
      ]
    : [
        {
          q: 'How does contactless NFC and QR stamp collecting work?',
          a: 'Customers simply open their digital card and tap their smartphone against the counter reader via NFC, or present their unique dynamic QR code for instant scan in under 2 seconds.',
        },
        {
          q: 'What happens when 8 stamps are completed?',
          a: 'The 8th stamp automatically unlocks an instant complimentary specialty drink reward, ready to redeem at the counter, or you can exchange stamps for catalog rewards.',
        },
        {
          q: 'How do stamp exchanges work from the rewards catalog?',
          a: 'You can choose any reward, pastry, coffee beans, or gift from the Rewards Catalog. The designated stamp cost is deducted directly from your stamp card at the counter.',
        },
        {
          q: 'How do I receive my card via WhatsApp?',
          a: 'Upon registration, our integrated WhatsApp CRM instantly beams a personalized welcome greeting and direct link to your digital pass.',
        },
      ];

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Quick Login Modal */}
      <QuickLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultTab={modalTab}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Fresh Ambient Gradient Background (Indigo, Cyan, Teal - No Muddy Browns!) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-indigo-400/20 via-cyan-400/20 to-transparent blur-3xl" />
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-400/15 via-blue-500/15 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & Login Access CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
              
              {/* Vibrant Feature Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-cyan-300 text-xs font-extrabold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400 animate-pulse" />
                <span>{t('landingHeroBadge')}</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-cyan-300 dark:to-teal-300">
                  {t('landingHeroTitle1')}
                </span>
                <span className="block mt-1">{t('landingHeroTitle2')}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t('landingHeroSubtitle')}
              </p>

              {/* PRIMARY ACCESS CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                
                {/* 1. Main Button: Access Digital Pass / Login */}
                <button
                  type="button"
                  id="hero-login-customer-btn"
                  onClick={() => openLogin('customer')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group"
                >
                  <Smartphone className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition" />
                  <span>{t('landingCtaCustomer')}</span>
                  <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                </button>

                {/* 2. Secondary Button: Staff & Owner Portals */}
                <button
                  type="button"
                  id="hero-login-staff-btn"
                  onClick={() => openLogin('barista')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <KeyRound className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  <span>{t('landingCtaStaff')}</span>
                </button>
              </div>

            </div>

            {/* Right Column: Interactive Live Digital Card Simulation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm relative">
                
                {/* Visual Glow Aura */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 opacity-30 blur-xl animate-pulse" />

                {/* Card Container */}
                <div className="relative rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-5">
                  
                  {/* Top Card Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                        <Coffee className="w-5 h-5 text-cyan-200" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                          {isAr ? settings.shopNameAr : settings.shopNameEn}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                          <span>NFC • VIP Pass</span>
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black tracking-wide uppercase border border-emerald-300 dark:border-emerald-700">
                      {isAr ? 'عضو ولاء' : 'Loyalty Member'}
                    </span>
                  </div>

                  {/* Stamp Grid (8 Cups) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                      <span>{isAr ? 'محفظة الأختام' : 'Stamp Progress'}</span>
                      <span className="font-mono text-indigo-600 dark:text-cyan-400">
                        {simulatedStamps} / 8 {isAr ? 'أختام' : 'Stamps'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                      {Array.from({ length: 8 }).map((_, idx) => {
                        const isStamped = idx < simulatedStamps;
                        const isReward = idx === 7;
                        return (
                          <div
                            key={idx}
                            className={`h-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                              isStamped
                                ? isReward
                                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md scale-105 animate-bounce'
                                  : 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-400 border border-dashed border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isReward ? (
                              <Gift className="w-4 h-4" />
                            ) : (
                              <Coffee className="w-4 h-4" />
                            )}
                            <span className="text-[9px] font-mono mt-0.5">#{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stamp simulation feedback */}
                  {stampFeedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 text-center animate-fadeIn">
                      {stampFeedback}
                    </div>
                  )}

                  {/* Interactive Button to Simulate Counter Tap */}
                  <button
                    type="button"
                    onClick={handleSimulateStamp}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                    <span>
                      {simulatedStamps === 8
                        ? isAr
                          ? '🎉 ابدأ دورة جديدة'
                          : '🎉 Reset Stamp Cycle'
                        : isAr
                        ? '👈 اضغط هنا لتجربة لمس الختم الثامن'
                        : '👈 Tap to Simulate 8th Free Drink Stamp'}
                    </span>
                  </button>

                  {/* Quick Card Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">
                        {isAr ? 'إجمالي الأختام المكتسبة' : 'Total Lifetime Stamps'}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                        16 ☕
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openLogin('customer')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>{isAr ? 'فتح بطاقتي' : 'Open Pass'}</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DIRECT PORTAL ACCESS SECTION (Customer, Barista, Owner) */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('landingChoosePortal')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isAr
                ? 'وصول مباشر وفوري لكافة أطراف تجربة القهوة: العملاء، طاقم الباريستا، وإدارة المتجر'
                : 'Direct, streamlined login access for coffee lovers, counter staff, and shop management.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PORTAL 1: CUSTOMER PASS */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-800/70 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {isAr ? 'بوابة العميل الرقمية' : 'Customer Rewards Pass'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t('landingCustomerLoginDesc')}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => openLogin('customer')}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل الدخول لبطاقتي' : 'Sign In with Card / Phone'}</span>
                </button>
              </div>
            </div>

            {/* PORTAL 2: BARISTA COUNTER */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-cyan-50/50 to-white dark:from-slate-800/70 dark:to-slate-900 border border-cyan-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {isAr ? 'كاونتر ونقاط بيع الباريستا' : 'Barista POS Desk'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t('landingBaristaLoginDesc')}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => openLogin('barista')}
                  className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isAr ? 'دخول الكاونتر برمز PIN' : 'Enter Barista PIN'}</span>
                </button>
              </div>
            </div>

            {/* PORTAL 3: OWNER DASHBOARD */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-teal-50/50 to-white dark:from-slate-800/70 dark:to-slate-900 border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-5 shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {isAr ? 'لوحة تحكم إدارة المتجر' : 'Owner & Management'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t('landingOwnerLoginDesc')}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => openLogin('owner')}
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'دخول لوحة الإدارة برمز PIN' : 'Unlock Owner Dashboard'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4-PILLAR FEATURES GRID */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-indigo-600 dark:text-cyan-400">
              {isAr ? 'مميزات عصرية متكاملة' : 'State-of-the-Art Ecosystem'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? 'كل ما يحتاجه مقهاك في تجربة ولاء واحدة' : 'Everything Your Café Needs for High Retention'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: NFC & QR */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 transition">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                {t('landingFeature1Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingFeature1Desc')}
              </p>
            </div>

            {/* Feature 2: Rewards & Replacement */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-300 transition">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                {t('landingFeature2Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingFeature2Desc')}
              </p>
            </div>

            {/* Feature 3: Daily Wheel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                {t('landingFeature3Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingFeature3Desc')}
              </p>
            </div>

            {/* Feature 4: WhatsApp CRM */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                {t('landingFeature4Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingFeature4Desc')}
              </p>
            </div>

          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{t('landingStatDrinks')}</p>
              <span className="text-xs text-indigo-100 mt-1 block">
                {isAr ? 'تم جمع أختامها بنجاح' : 'Stamps Tracked Seamlessly'}
              </span>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-white/20 py-4 sm:py-0">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{t('landingStatSpeed')}</p>
              <span className="text-xs text-indigo-100 mt-1 block">
                {isAr ? 'سرعة مسح الكاونتر الفائقة' : 'Ultra-Fast Tap Experience'}
              </span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{t('landingStatSatisfaction')}</p>
              <span className="text-xs text-indigo-100 mt-1 block">
                {isAr ? 'سعادة وولاء روّاد القهوة' : 'Guest Retention & Delight'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS (3 STEPS) */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('landingHowItWorksTitle')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isAr
                ? 'ثلاث خطوات بسيطة فقط تبدأ بها رحلة المكافآت المجانية والقهوة الاستثنائية'
                : 'Three effortless steps to start enjoying complimentary coffee and perks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t('landingStep1Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingStep1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t('landingStep2Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingStep2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t('landingStep3Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landingStep3Desc')}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* STAMP REWARDS & CATALOG SHOWCASE */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold mb-3 border border-indigo-500/20">
              <Coffee className="w-3.5 h-3.5" />
              <span>{isAr ? 'نظام ولاء مبسط وعصري' : 'Simplified Modern Loyalty'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isAr ? 'نظام الأختام الرقمية وكتالوج المكافآت' : 'Digital Stamp System & Rewards Catalog'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isAr
                ? 'نظام مكافآت شفاف وبسيط بدون تعقيدات النقاط أو المستويات. اجمع الأختام مع كل فنجان واستبدلها فورياً بهدايا ومشروبات من الكتالوج.'
                : 'A transparent and straightforward rewards program without complicated tiers or points math. Collect stamps with every cup and exchange them anytime from the rewards catalog.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Coffee,
                color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
                titleEn: '1 Cup = 1 Stamp',
                titleAr: 'كوب قهوة = ختم رقمي',
                descEn: 'Collect a digital stamp with every barista-crafted drink. Scan QR or tap NFC in 1 second.',
                descAr: 'احصل على ختم رقمي فوري مع كل كوب قهوة أو مشروب مختص عبر مسح QR أو ملامسة NFC.',
                badge: isAr ? 'فوري وسريع' : 'Instant & Fast',
              },
              {
                icon: Gift,
                color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
                titleEn: '8 Stamps = Free Drink',
                titleAr: '8 أختام = مشروب مجاني',
                descEn: 'Complete your 8-stamp card and enjoy a free specialty coffee or signature drink on the house.',
                descAr: 'أكمل بطاقة الـ 8 أختام واستمتع بمشروب قهوة مختصة مجاني بالكامل من اختيارك.',
                badge: isAr ? 'مشروب مجاني' : 'Free Beverage',
              },
              {
                icon: Sparkles,
                color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
                titleEn: 'Rewards Catalog Exchange',
                titleAr: 'كتالوج استبدال الأختام',
                descEn: 'Exchange your collected stamps anytime for delicious croissants, specialty beans, or merch.',
                descAr: 'استبدل أختامك المتراكمة بأي وقت بكرواسون طازج، أكياس بن مختص، أو هدايا مميزة من الكتالوج.',
                badge: isAr ? 'استبدال مباشر' : 'Direct Exchange',
              },
              {
                icon: CheckCircle2,
                color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
                titleEn: 'Zero Cards to Lose',
                titleAr: 'بطاقة في محفظة هاتفك',
                descEn: 'Your loyalty card lives safely in your browser or Apple/Google wallet with instant live balance.',
                descAr: 'بطاقتك الرقمية محفوظة بهاتفك بدون بطاقات ورقية ضائعة، مع تحديثات مباشرة وتذكير عبر واتساب.',
                badge: isAr ? 'محفظة رقمية' : 'Digital Pass',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isAr ? feature.titleAr : feature.titleEn}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isAr ? feature.descAr : feature.descEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-cyan-400">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نظام أختام 100%' : '100% Stamp System'}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white mb-10">
            {t('landingFaqTitle')}
          </h2>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 transition"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full p-4.5 text-left rtl:text-right flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Bottom Sign-In Banner */}
          <div className="mt-14 p-8 rounded-3xl bg-slate-900 text-white dark:bg-slate-800 text-center space-y-4 shadow-xl">
            <h3 className="text-xl font-bold">
              {isAr ? 'جاهز للبدء وحصد المكافآت؟' : 'Ready to Start Earning Free Coffee?'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {isAr
                ? 'سجل دخولك الآن برقم بطاقتك أو رقم جوالك واستمتع بأولى رشفات الولاء'
                : 'Sign in with your card or phone number now and unlock instant coffee rewards.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openLogin('customer')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                {isAr ? 'الدخول لبطاقة العميل' : 'Open My Customer Pass'}
              </button>
              <button
                type="button"
                onClick={() => openLogin('barista')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                {isAr ? 'كاونتر الباريستا' : 'Barista POS'}
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
