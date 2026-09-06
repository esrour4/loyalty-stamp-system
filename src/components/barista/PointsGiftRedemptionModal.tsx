import React, { useState, useMemo } from 'react';
import {
  Gift,
  Search,
  Check,
  RotateCcw,
  Coffee,
  Croissant,
  Package,
  ShoppingBag,
  Sparkles,
  X,
  AlertCircle,
  Coins,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, RewardItem, Transaction } from '../../types';

interface PointsGiftRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  baristaName: string;
}

export const PointsGiftRedemptionModal: React.FC<PointsGiftRedemptionModalProps> = ({
  isOpen,
  onClose,
  customer,
  baristaName,
}) => {
  const {
    rewards,
    transactions,
    language,
    t,
    redeemCatalogReward,
    refundOrReplacePointsReward,
    redeemCustomPointsGift,
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'catalog' | 'replace' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Confirmation state for standard reward
  const [confirmReward, setConfirmReward] = useState<RewardItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refund state for a previous transaction
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Custom Gift state
  const [customDescription, setCustomDescription] = useState('');
  const [customPointsCost, setCustomPointsCost] = useState<number>(50);

  // Filter rewards
  const filteredRewards = useMemo(() => {
    return rewards.filter((r) => {
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

  // Customer's recent points redemptions
  const customerPointsTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.customerId === customer.id && (tx.type === 'points_redeem' || tx.type === 'points_refund'))
      .slice(0, 15);
  }, [transactions, customer.id]);

  if (!isOpen) return null;

  // Handle Standard Reward Redemption
  const handleConfirmRedeem = async () => {
    if (!confirmReward) return;
    setIsProcessing(true);
    try {
      await redeemCatalogReward(customer.id, confirmReward.id, baristaName);
      setConfirmReward(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Refund / Replacement of Points
  const handleConfirmRefund = async () => {
    if (!selectedTxForRefund) return;
    setIsProcessing(true);
    try {
      const pointsToRefund = Math.abs(selectedTxForRefund.pointsChanged);
      const reasonText = refundReason.trim() || (isAr ? 'تبديل هدية / استرجاع من الكاونتر' : 'Counter gift exchange / return');
      await refundOrReplacePointsReward(customer.id, pointsToRefund, reasonText, baristaName);
      setSelectedTxForRefund(null);
      setRefundReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Custom Points Gift
  const handleCustomRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDescription || customPointsCost <= 0) return;
    setIsProcessing(true);
    try {
      await redeemCustomPointsGift(customer.id, customPointsCost, customDescription, baristaName);
      setCustomDescription('');
      setCustomPointsCost(50);
    } finally {
      setIsProcessing(false);
    }
  };

  // Category Icon helper
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'drink':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'pastry':
        return <Croissant className="w-4 h-4 text-orange-500" />;
      case 'beans':
        return <Package className="w-4 h-4 text-emerald-500" />;
      case 'merch':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'discount':
        return <Percent className="w-4 h-4 text-purple-500" />;
      default:
        return <Gift className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        
        {/* Header with Customer Summary */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {t('pointsGiftsTitle')}
              </h3>
              <p className="text-[11px] text-stone-300">
                {t('pointsGiftsSubtitle')}
              </p>
            </div>
          </div>

          {/* Customer Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 mt-2">
            <div>
              <span className="text-xs font-bold text-stone-200 block">
                {customer.name}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {customer.cardNumber} • {customer.phone}
              </span>
            </div>
            <div className="text-right rtl:text-left">
              <span className="text-[10px] text-amber-200 block uppercase font-semibold">
                {t('pointsBalance')}
              </span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">
                {customer.totalPoints} pts
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('catalog');
                setConfirmReward(null);
                setSelectedTxForRefund(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{t('pointsGiftsCatalog')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('replace');
                setConfirmReward(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'replace'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('replaceOrRefundGift')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('custom');
                setConfirmReward(null);
                setSelectedTxForRefund(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'هدية مخصصة' : 'Custom Gift'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: CATALOG OF GIFTS */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute top-3 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? 'البحث عن هدية أو مكافأة...' : 'Search rewards catalog...'}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'drink', 'pastry', 'beans', 'merch'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {cat === 'all' && (isAr ? 'الكل' : 'All')}
                      {cat === 'drink' && (isAr ? 'مشروبات' : 'Drinks')}
                      {cat === 'pastry' && (isAr ? 'حلوى ومخبوزات' : 'Pastries')}
                      {cat === 'beans' && (isAr ? 'حبوب بن' : 'Beans')}
                      {cat === 'merch' && (isAr ? 'أكواب وهدايا' : 'Merch')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Popover if a reward is clicked */}
              {confirmReward && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {isAr ? confirmReward.titleAr : confirmReward.titleEn}
                        </h4>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                          {isAr ? 'صرف الهدية للعميل مقابل النقاط' : 'Redeem gift for customer'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmReward(null)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <div>
                      <span className="text-[10px] text-stone-400 block">{isAr ? 'رصيد العميل الحالي' : 'Current Points'}</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">{customer.totalPoints} pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-500 block">{isAr ? 'تكلفة الهدية' : 'Gift Cost'}</span>
                      <span className="font-bold text-red-500 font-mono">-{confirmReward.pointsCost} pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 block">{isAr ? 'المتبقي بعد الصرف' : 'New Balance'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {customer.totalPoints - confirmReward.pointsCost} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReward(null)}
                      className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleConfirmRedeem}
                      className="flex-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('confirmRedeemGift')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredRewards.map((reward) => {
                  const canAfford = customer.totalPoints >= reward.pointsCost;
                  const isAvailable = reward.available !== false;

                  return (
                    <div
                      key={reward.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        canAfford && isAvailable
                          ? 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-amber-400 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-850/50 border-stone-200/60 dark:border-stone-800/60 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                              {renderCategoryIcon(reward.category)}
                            </div>
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                              {isAr ? reward.titleAr : reward.titleEn}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                            {reward.pointsCost} pts
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3 line-clamp-2 leading-relaxed">
                          {isAr ? reward.descriptionAr : reward.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-700/60">
                        <span className="text-[10px] text-stone-400 capitalize">
                          {reward.category}
                        </span>

                        {canAfford && isAvailable ? (
                          <button
                            type="button"
                            onClick={() => setConfirmReward(reward)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 active:scale-98 cursor-pointer"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>{isAr ? 'صرف الهدية' : 'Redeem'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-400">
                            {!isAvailable
                              ? isAr ? 'غير متوفر حالياً' : 'Out of Stock'
                              : isAr
                              ? `ينقصه ${reward.pointsCost - customer.totalPoints} نقطة`
                              : `Needs ${reward.pointsCost - customer.totalPoints} more pts`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRewards.length === 0 && (
                <div className="py-8 text-center text-stone-400 text-xs">
                  {isAr ? 'لم يتم العثور على هدايا مطابقة.' : 'No matching reward items found.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPLACE GIFT OR REFUND POINTS */}
          {activeTab === 'replace' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  {isAr
                    ? 'في حال رغبة العميل بتبديل الهدية المصروفة سابقاً بصنف آخر، أو إرجاع الهدية واستعادة نقاطه، يمكنك استرجاع النقاط لحسابه بضغطة زر وتوثيق العملية في سجل الكاونتر.'
                    : 'If the customer wishes to exchange a previously redeemed gift for another item, or returned an item, you can instantly refund points to their account here.'}
                </p>
              </div>

              {/* Confirmation Modal for Refund */}
              {selectedTxForRefund && (
                <div className="p-4 rounded-2xl bg-stone-900 text-white dark:bg-stone-800 border border-amber-500 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4" />
                      <span>{t('confirmRefundPoints')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTxForRefund(null)}
                      className="text-stone-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-300">
                    {isAr
                      ? `سيتم استرجاع +${Math.abs(selectedTxForRefund.pointsChanged)} نقطة إلى حساب العميل (${customer.name}).`
                      : `Will refund +${Math.abs(selectedTxForRefund.pointsChanged)} points to ${customer.name}.`}
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      {t('reasonForRefund')}
                    </label>
                    <input
                      type="text"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder={t('refundReasonPlaceholder')}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-400 outline-hidden"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTxForRefund(null)}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleConfirmRefund}
                      className="flex-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('refundPointsBtn')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  {t('recentPointsRedemptions')}
                </span>

                {customerPointsTransactions.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    {t('noRecentRedemptions')}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {customerPointsTransactions.map((tx) => {
                      const isRedeem = tx.type === 'points_redeem';
                      return (
                        <div
                          key={tx.id}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isRedeem
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {isRedeem ? (isAr ? 'صرف هدية' : 'Redemption') : (isAr ? 'استرجاع نقاط' : 'Refund')}
                              </span>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                {isAr ? tx.detailsAr : tx.detailsEn}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(tx.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                              <span>• {tx.performedBy}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs font-mono font-bold ${
                                isRedeem ? 'text-red-500' : 'text-emerald-500'
                              }`}
                            >
                              {tx.pointsChanged > 0 ? `+${tx.pointsChanged}` : tx.pointsChanged} pts
                            </span>

                            {isRedeem && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTxForRefund(tx);
                                  setRefundReason(isAr ? `تبديل هدية (${tx.detailsAr})` : `Exchange (${tx.detailsEn})`);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-amber-500 hover:text-white text-stone-700 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{isAr ? 'تبديل / استرجاع' : 'Swap / Refund'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM GIFT OR MANUAL ADJUSTMENT */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
                {isAr
                  ? 'استخدم هذا القسم لصرف هدايا موسمية خاصة غير مسجلة بالكتالوج، أو لتسوية النقاط يدوياً مع العميل عند الكاونتر.'
                  : 'Use this section to redeem custom or unlisted promotional gifts with points, or make manual points adjustments at the counter.'}
              </div>

              <form onSubmit={handleCustomRedeem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('customGiftName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder={isAr ? 'مثال: كوب زجاجي موسمي، أو خصم خاص على وجبة' : 'e.g. Seasonal Glass Tumbler or Special Meal Concession'}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('customPointsCost')} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={5}
                      max={customer.totalPoints}
                      step={5}
                      value={customPointsCost}
                      onChange={(e) => setCustomPointsCost(Math.max(0, Number(e.target.value)))}
                      className="w-32 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 outline-hidden"
                    />
                    <div className="flex gap-1.5">
                      {[50, 100, 150, 200].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCustomPointsCost(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            customPointsCost === val
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {val} pts
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation preview */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-300">
                    {t('pointsBalanceAfter')}:
                  </span>
                  <span className={`font-mono font-bold ${
                    customer.totalPoints >= customPointsCost ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    {customer.totalPoints - customPointsCost} pts
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || customer.totalPoints < customPointsCost || !customDescription}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>
                    {isAr
                      ? `تأكيد صرف الهدية المخصصة (-${customPointsCost} نقطة)`
                      : `Confirm Custom Gift Redemption (-${customPointsCost} pts)`}
                  </span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-stone-500">
            {isAr ? `الباريستا المسؤول: ${baristaName}` : `Active Barista: ${baristaName}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
