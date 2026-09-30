import React, { useState, useMemo } from 'react';
import {
  Gift,
  Search,
  Check,
  Coffee,
  Croissant,
  Package,
  ShoppingBag,
  Sparkles,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, RewardItem } from '../../types';

interface StampRewardsExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  baristaName: string;
}

export const StampRewardsExchangeModal: React.FC<StampRewardsExchangeModalProps> = ({
  isOpen,
  onClose,
  customer,
  baristaName,
}) => {
  const {
    rewards,
    language,
    t,
    redeemCatalogReward,
  } = useApp();

  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmReward, setConfirmReward] = useState<RewardItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter rewards
  const filteredRewards = useMemo(() => {
    return rewards.filter((r) => {
      if (!r.available) return false;
      const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.titleEn.toLowerCase().includes(q) ||
        r.titleAr.toLowerCase().includes(q) ||
        r.descriptionEn.toLowerCase().includes(q) ||
        r.descriptionAr.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [rewards, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleConfirmExchange = async () => {
    if (!confirmReward) return;
    try {
      setIsProcessing(true);
      const res = await redeemCatalogReward(customer.id, confirmReward.id, baristaName);
      if (res.success) {
        setConfirmReward(null);
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drink':
        return <Coffee className="w-4 h-4 text-cyan-500" />;
      case 'pastry':
        return <Croissant className="w-4 h-4 text-amber-500" />;
      case 'beans':
        return <Package className="w-4 h-4 text-emerald-500" />;
      default:
        return <Gift className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3 bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isAr ? 'كتالوج استبدال مكافآت الأختام' : 'Stamp Rewards Exchange'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'استبدال أختام العميل المتراكمة بهدايا ومشروبات من الكتالوج'
                  : 'Exchange customer collected stamps for drinks, bakery & gifts'}
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

        {/* Customer Balance Banner */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
              {customer.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                {customer.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {customer.cardNumber} • {customer.phone}
              </span>
            </div>
          </div>

          {/* Current Stamps Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-black shadow-xs">
            <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              {customer.currentStamps} {isAr ? 'أختام متوفرة بالبطاقة' : 'Stamps Available'}
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: isAr ? 'كافة المكافآت' : 'All Rewards' },
              { id: 'drink', label: isAr ? 'مشروبات' : 'Drinks' },
              { id: 'pastry', label: isAr ? 'مخبوزات' : 'Bakery' },
              { id: 'beans', label: isAr ? 'محاصيل بن' : 'Beans' },
              { id: 'merch', label: isAr ? 'منتجات وهدايا' : 'Merch' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في المكافآت...' : 'Search rewards...'}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Rewards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredRewards.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Gift className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p>{isAr ? 'لا توجد مكافآت مطابقة للبحث' : 'No rewards found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredRewards.map((reward) => {
                const stampsCost = reward.stampsCost || Math.max(1, Math.round((reward.pointsCost || 80) / 20)) || 4;
                const canAfford = customer.currentStamps >= stampsCost;
                const missingStamps = stampsCost - customer.currentStamps;

                return (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      canAfford
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs hover:border-indigo-400'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                            {getCategoryIcon(reward.category)}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {isAr ? reward.titleAr : reward.titleEn}
                          </h4>
                        </div>

                        {/* Stamp Cost Pill */}
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-cyan-300 font-mono font-black text-xs shrink-0 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>{stampsCost} {isAr ? 'أختام' : 'stamps'}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {isAr ? reward.descriptionAr : reward.descriptionEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {reward.category}
                      </span>

                      {canAfford ? (
                        <button
                          type="button"
                          onClick={() => setConfirmReward(reward)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? 'استبدال الآن' : 'Exchange'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          {isAr ? `ينقصه ${missingStamps} أختام` : `${missingStamps} stamps needed`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Overlay Modal */}
        {confirmReward && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {isAr ? 'تأكيد استبدال الهدية' : 'Confirm Stamp Exchange'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isAr ? (
                    <>
                      هل أنت متأكد من خصم{' '}
                      <strong className="text-indigo-600 dark:text-cyan-400">
                        {confirmReward.stampsCost || 4} أختام
                      </strong>{' '}
                      من بطاقة العميل <strong>{customer.name}</strong> لتسليمه هدية:{' '}
                      <strong className="text-slate-900 dark:text-slate-100">{confirmReward.titleAr}</strong>؟
                    </>
                  ) : (
                    <>
                      Are you sure you want to deduct{' '}
                      <strong className="text-indigo-600 dark:text-cyan-400">
                        {confirmReward.stampsCost || 4} stamps
                      </strong>{' '}
                      from <strong>{customer.name}</strong> for:{' '}
                      <strong className="text-slate-900 dark:text-slate-100">{confirmReward.titleEn}</strong>?
                    </>
                  )}
                </p>
              </div>

              {/* Balance after preview */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{isAr ? 'رصيد الأختام بعد الاستبدال:' : 'Remaining Stamps After:'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {customer.currentStamps - (confirmReward.stampsCost || 4)} {isAr ? 'أختام' : 'stamps'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmReward(null)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExchange}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (isAr ? 'جاري الاستبدال...' : 'Exchanging...') : isAr ? 'تأكيد وتسليم' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Also export as PointsGiftRedemptionModal for backward compatibility
export const PointsGiftRedemptionModal = StampRewardsExchangeModal;
