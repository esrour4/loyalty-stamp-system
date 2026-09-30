import React, { useState } from 'react';
import {
  Cake,
  Clock,
  Coffee,
  History,
  LogOut,
  MessageSquare,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerLoginRegister } from './CustomerLoginRegister';
import { DigitalStampCard } from './DigitalStampCard';
import { DailyWheelModal } from './DailyWheelModal';
import { ReferralCard } from './ReferralCard';
import { FeedbackModal } from './FeedbackModal';
import { CustomerMenuView } from '../menu/CustomerMenuView';

export const CustomerPortal: React.FC = () => {
  const {
    currentCustomer,
    logoutCustomer,
    transactions,
    language,
    t,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'card' | 'menu' | 'history'>('card');
  const [showWheel, setShowWheel] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const isAr = language === 'ar';

  if (!currentCustomer) {
    return <CustomerLoginRegister />;
  }

  // Check Birthday status
  const isBirthday = (() => {
    if (!currentCustomer.dateOfBirth) return false;
    const today = new Date();
    const dob = new Date(currentCustomer.dateOfBirth);
    return today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth();
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Customer Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
            {currentCustomer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentCustomer.name}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentCustomer.status === 'pending'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-cyan-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                }`}
              >
                {currentCustomer.status === 'pending' ? t('pendingStatus') : isAr ? 'عضو ولاء' : 'Loyalty Member'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              {currentCustomer.cardNumber} • {currentCustomer.phone}
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Wheel Trigger (Rendered when enabled by owner) */}
          {settings.wheel?.enabled !== false && (
            <button
              type="button"
              id="open-wheel-game-btn"
              onClick={() => setShowWheel(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('spinWheelTitle')}</span>
            </button>
          )}

          {/* Feedback Trigger */}
          <button
            type="button"
            id="open-feedback-btn"
            onClick={() => setShowFeedback(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition cursor-pointer"
            title={t('feedbackTitle')}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            type="button"
            id="customer-logout-btn"
            onClick={logoutCustomer}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 transition cursor-pointer"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Approval Notice Banner (if applicable) */}
      {currentCustomer.status === 'pending' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700/60 text-slate-900 dark:text-cyan-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">{t('approvalPendingTitle')}</h4>
              <p className="text-xs text-indigo-800 dark:text-cyan-300/90 mt-1 leading-relaxed">
                {t('approvalPendingDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Banner */}
      {isBirthday && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-orange-500/20 border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-3">
            <Cake className="w-7 h-7 text-rose-500 animate-bounce shrink-0" />
            <div>
              <h4 className="text-sm font-extrabold">{t('birthdayGreeting')} 🎉</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {t('birthdayPerk')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('card')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'card'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{t('yourDigitalCard')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>{isAr ? 'قائمة المقهى' : 'Cafe Menu'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('activityHistory')}</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          <DigitalStampCard />

          {/* Quick Perks & Referral Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stamp System Explanation & Benefits */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Coffee className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'برنامج أختام القهوة' : 'Stamp Loyalty Program'}
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{isAr ? 'ختم رقمي مجاني مع كل كوب قهوة أو مشروب مختص' : '1 digital stamp with every specialty coffee drink'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  <span>{isAr ? `اجمع ${settings.stampsForFreeDrink || 8} أختام واحصل على مشروبك القادم مجاناً فورياً` : `Collect ${settings.stampsForFreeDrink || 8} stamps to unlock your complimentary drink`}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>{isAr ? 'أظهر رمز QR للباريستا عند الطلب لتسجيل أختامك بثوانٍ' : 'Show your QR code to the barista to register your stamps in seconds'}</span>
                </li>
              </ul>
            </div>

            {/* Referral Card */}
            <ReferralCard />
          </div>
        </div>
      )}

      {/* Artisan Coffee & Food Menu Tab */}
      {activeTab === 'menu' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'قائمة المشروبات والمأكولات المختصة' : 'Artisan Beverage & Food Menu'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'أسعار حية ومباشرة من مقهانا' : 'Live specialty coffee & bakery catalog'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? 'متصل بقاعدة البيانات السحابية' : 'Cloud Firestore Live'}
            </span>
          </div>

          <CustomerMenuView />
        </div>
      )}

      {/* Transaction & Activity History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>{t('activityHistory')}</span>
          </h3>

          {transactions.filter((tx) => tx.customerId === currentCustomer.id).length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t('noTransactions')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 px-2">{t('date')}</th>
                    <th className="pb-3 px-2">{t('activity')}</th>
                    <th className="pb-3 px-2">{t('stamps')}</th>
                    <th className="pb-3 px-2">{t('staff')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions
                    .filter((tx) => tx.customerId === currentCustomer.id)
                    .map((tx) => (
                      <tr key={tx.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-2 font-mono text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {isAr ? tx.detailsAr : tx.detailsEn}
                        </td>
                        <td className="py-3 px-2 font-bold text-indigo-600 dark:text-cyan-400">
                          {tx.stampsChanged > 0 ? `+${tx.stampsChanged}` : tx.stampsChanged} ☕
                        </td>
                        <td className="py-3 px-2 text-slate-400">{tx.performedBy}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Wheel Modal */}
      <DailyWheelModal isOpen={showWheel} onClose={() => setShowWheel(false)} />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
};
