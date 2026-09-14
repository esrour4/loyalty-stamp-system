import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit2,
  Mail,
  Phone,
  Power,
  Shield,
  ShieldAlert,
  Sparkles,
  Ticket,
  User,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { useApp, DEFAULT_TIER_CONFIGS } from '../../context/AppContext';
import { Customer, TierLevel } from '../../types';

interface CustomerEditModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: Customer) => void;
  onToggleStatus: (customerId: string, newStatus?: 'approved' | 'pending' | 'suspended') => void;
}

export const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave,
  onToggleStatus,
}) => {
  const { language, t, tierConfigs, settings } = useApp();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [currentStamps, setCurrentStamps] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [status, setStatus] = useState<'approved' | 'pending' | 'suspended'>('approved');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setDateOfBirth(customer.dateOfBirth || '');
      setCurrentStamps(customer.currentStamps || 0);
      setTotalPoints(customer.totalPoints || 0);
      setStatus(customer.status || 'approved');
      setReferralCode(customer.referralCode || '');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  // Calculate predicted tier from points
  const activeTiers = tierConfigs || settings.tiers || DEFAULT_TIER_CONFIGS;
  const calculatePredictedTier = (pts: number): TierLevel => {
    const levels: TierLevel[] = ['platinum', 'gold', 'silver', 'bronze'];
    levels.sort((a, b) => {
      const minA = activeTiers[a]?.minPoints ?? DEFAULT_TIER_CONFIGS[a].minPoints;
      const minB = activeTiers[b]?.minPoints ?? DEFAULT_TIER_CONFIGS[b].minPoints;
      return minB - minA;
    });

    for (const lvl of levels) {
      const min = activeTiers[lvl]?.minPoints ?? DEFAULT_TIER_CONFIGS[lvl].minPoints;
      if (pts >= min) {
        return lvl;
      }
    }
    return 'bronze';
  };

  const predictedTierKey = calculatePredictedTier(totalPoints);
  const predictedTierConfig = activeTiers[predictedTierKey] || DEFAULT_TIER_CONFIGS[predictedTierKey];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const updated: Customer = {
      ...customer,
      name: name.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      currentStamps: Math.min(settings.stampsForFreeDrink || 8, Math.max(0, currentStamps)),
      totalPoints: Math.max(0, totalPoints),
      tier: predictedTierKey,
      status,
      referralCode: referralCode.trim() || customer.referralCode,
    };

    onSave(updated);
    onClose();
  };

  const handleQuickStatusToggle = () => {
    const nextStatus = status === 'suspended' ? 'approved' : 'suspended';
    setStatus(nextStatus);
    onToggleStatus(customer.id, nextStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('editCustomerTitle')}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {customer.cardNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Status Quick Toggle Banner */}
        <div
          className={`px-5 py-3 flex items-center justify-between border-b text-xs font-semibold ${
            status === 'suspended'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
              : status === 'pending'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-amber-900 text-indigo-800 dark:text-cyan-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {status === 'suspended' ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            ) : status === 'pending' ? (
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>
              {status === 'suspended'
                ? isAr
                  ? 'الحساب معطل وموقوف حالياً'
                  : 'Account is currently disabled/suspended'
                : status === 'pending'
                ? isAr
                  ? 'الحساب بانتظار الاعتماد'
                  : 'Account is pending approval'
                : isAr
                ? 'الحساب مفعّل ونشط'
                : 'Account is active'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickStatusToggle}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              status === 'suspended'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {status === 'suspended'
                ? isAr
                  ? 'تفعيل الحساب'
                  : 'Enable Account'
                : isAr
                ? 'تعطيل الحساب'
                : 'Disable Account'}
            </span>
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('phone')} *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+963..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date of birth & Referral Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('dob')}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('yourReferralCode')}
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Stamps & Points with Tier recalculation preview */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-indigo-500/10 border border-indigo-200 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'الأختام والنقاط وفئة العميل' : 'Stamps, Points & Member Tier'}</span>
              </span>

              {/* Dynamic Predicted Tier Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: predictedTierConfig.color }}
                />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? predictedTierConfig.nameAr : predictedTierConfig.nameEn}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('currentStampsCount')} (0 - {settings.stampsForFreeDrink || 8})
                </label>
                <input
                  type="number"
                  min={0}
                  max={settings.stampsForFreeDrink || 8}
                  value={currentStamps}
                  onChange={(e) => setCurrentStamps(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('pointsBalance')}
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr
                ? `⚡ يتم تحديد فئة العميل تلقائياً بناءً على النقاط (${totalPoints} نقطة = ${predictedTierConfig.nameAr}).`
                : `⚡ Member tier updates dynamically based on configured thresholds (${totalPoints} pts = ${predictedTierConfig.nameEn}).`}
            </p>
          </div>

          {/* Account Status Radio Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('accountStatus')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: 'approved' as const,
                  label: isAr ? 'مفعل ونشط' : 'Active',
                  color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
                },
                {
                  value: 'suspended' as const,
                  label: isAr ? 'معطل وموقوف' : 'Disabled',
                  color: 'border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
                },
                {
                  value: 'pending' as const,
                  label: isAr ? 'معلق للطلب' : 'Pending',
                  color: 'border-indigo-500 text-amber-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-cyan-300',
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    status === opt.value
                      ? `${opt.color} ring-2 ring-offset-1`
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
            >
              {t('saveCustomerChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
