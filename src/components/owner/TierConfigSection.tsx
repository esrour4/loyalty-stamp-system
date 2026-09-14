import React, { useState } from 'react';
import {
  Award,
  Check,
  Crown,
  Edit3,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { useApp, DEFAULT_TIER_CONFIGS } from '../../context/AppContext';
import { TierConfig, TierLevel } from '../../types';

export const TierConfigSection: React.FC = () => {
  const {
    tierConfigs,
    updateAllTierConfigs,
    syncCustomersTiers,
    customers,
    language,
    t,
  } = useApp();

  const isAr = language === 'ar';

  // Local editable tier configs state
  const [localTiers, setLocalTiers] = useState<Record<TierLevel, TierConfig>>(() => {
    return JSON.parse(JSON.stringify(tierConfigs || DEFAULT_TIER_CONFIGS));
  });

  const [selectedTierKey, setSelectedTierKey] = useState<TierLevel>('bronze');
  const [isSaving, setIsSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newPerkEn, setNewPerkEn] = useState('');
  const [newPerkAr, setNewPerkAr] = useState('');

  const tierOrder: TierLevel[] = ['bronze', 'silver', 'gold', 'platinum'];

  // Handle field change for currently selected tier
  const handleFieldChange = <K extends keyof TierConfig>(key: K, value: TierConfig[K]) => {
    setLocalTiers((prev) => ({
      ...prev,
      [selectedTierKey]: {
        ...prev[selectedTierKey],
        [key]: value,
      },
    }));
  };

  // Add perk to active tier
  const handleAddPerk = () => {
    if (!newPerkEn.trim() && !newPerkAr.trim()) return;
    const current = localTiers[selectedTierKey];
    const updatedPerksEn = [...(current.perksEn || []), newPerkEn.trim() || newPerkAr.trim()];
    const updatedPerksAr = [...(current.perksAr || []), newPerkAr.trim() || newPerkEn.trim()];

    setLocalTiers((prev) => ({
      ...prev,
      [selectedTierKey]: {
        ...prev[selectedTierKey],
        perksEn: updatedPerksEn,
        perksAr: updatedPerksAr,
      },
    }));

    setNewPerkEn('');
    setNewPerkAr('');
  };

  // Remove perk by index
  const handleRemovePerk = (index: number) => {
    const current = localTiers[selectedTierKey];
    const updatedPerksEn = (current.perksEn || []).filter((_, i) => i !== index);
    const updatedPerksAr = (current.perksAr || []).filter((_, i) => i !== index);

    setLocalTiers((prev) => ({
      ...prev,
      [selectedTierKey]: {
        ...prev[selectedTierKey],
        perksEn: updatedPerksEn,
        perksAr: updatedPerksAr,
      },
    }));
  };

  // Save all tier configurations
  const handleSaveTiers = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateAllTierConfigs(localTiers, true);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  // Sync tiers for all existing customers
  const handleManualSync = () => {
    setSyncing(true);
    syncCustomersTiers();
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  // Reset to system defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        isAr
          ? 'هل أنت متأكد من استعادة المستويات الافتراضية للنظام؟'
          : 'Are you sure you want to reset tier rules to system defaults?'
      )
    ) {
      setLocalTiers(JSON.parse(JSON.stringify(DEFAULT_TIER_CONFIGS)));
      updateAllTierConfigs(DEFAULT_TIER_CONFIGS, true);
    }
  };

  // Calculate customer counts per tier with current thresholds
  const getCustomerCountForTier = (tierKey: TierLevel) => {
    return customers.filter((c) => c.tier === tierKey).length;
  };

  const activeTier = localTiers[selectedTierKey] || DEFAULT_TIER_CONFIGS[selectedTierKey];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-indigo-600" />
            <span>{t('tierConfigTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {t('tierConfigDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            title={t('syncCustomerTiersDesc')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{t('syncCustomerTiers')}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium transition"
          >
            {isAr ? 'الافتراضي' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Tier Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tierOrder.map((key) => {
          const tier = localTiers[key] || DEFAULT_TIER_CONFIGS[key];
          const isSelected = selectedTierKey === key;
          const memberCount = getCustomerCountForTier(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTierKey(key)}
              className={`p-3.5 rounded-2xl text-start transition border flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-amber-500/5 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {memberCount} {isAr ? 'عميل' : 'users'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                  {isAr ? tier.nameAr : tier.nameEn}
                </span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 font-semibold block mt-0.5">
                  ≥ {tier.minPoints} {isAr ? 'نقطة' : 'pts'} ({tier.multiplier}x)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tier Edit Form */}
      <form onSubmit={handleSaveTiers} className="space-y-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: activeTier.color }}
              />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isAr ? `تعديل إعدادات: ${activeTier.nameAr}` : `Editing: ${activeTier.nameEn}`}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {t('tierColor')}:
              </span>
              <input
                type="color"
                value={activeTier.color}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
              />
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('tierNameAr')}
              </label>
              <input
                type="text"
                value={activeTier.nameAr}
                onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                placeholder="مثال: المحمص البرونزي"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('tierNameEn')}
              </label>
              <input
                type="text"
                value={activeTier.nameEn}
                onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                placeholder="e.g. Bronze Roaster"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Threshold Points & Multiplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>{t('minPointsRequired')}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedTierKey === 'bronze' ? (isAr ? 'عادة 0 للمبتدئين' : 'Usually 0') : ''}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={activeTier.minPoints}
                  onChange={(e) => handleFieldChange('minPoints', Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  required
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-slate-400">
                  {isAr ? 'نقطة' : 'pts'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>{t('pointsMultiplier')}</span>
                <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-bold">
                  {activeTier.multiplier}x {isAr ? 'مضاعفة' : 'Rate'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1.0}
                  max={5.0}
                  step={0.05}
                  value={activeTier.multiplier}
                  onChange={(e) => handleFieldChange('multiplier', Math.max(1.0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  required
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-slate-400">
                  x
                </span>
              </div>
            </div>
          </div>

          {/* Perks List */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t('tierPerksList')}
            </label>

            {/* List of current perks */}
            <div className="space-y-2 mb-3">
              {(activeTier.perksAr || []).map((perkAr, idx) => {
                const perkEn = (activeTier.perksEn || [])[idx] || perkAr;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {isAr ? perkAr : perkEn}
                      </span>
                      {isAr && (
                        <span className="text-[10px] text-slate-400 truncate">({perkEn})</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePerk(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 transition"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {(!activeTier.perksAr || activeTier.perksAr.length === 0) && (
                <p className="text-xs text-slate-400 italic py-1">
                  {isAr ? 'لا توجد مميزات مضافة لهذه الفئة بعد' : 'No perks added to this tier yet.'}
                </p>
              )}
            </div>

            {/* Add new perk inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newPerkAr}
                onChange={(e) => setNewPerkAr(e.target.value)}
                placeholder={isAr ? 'ميزة جديدة بالعربية (مثال: خصم 10% على الحلويات)' : 'New Perk in Arabic'}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPerkEn}
                  onChange={(e) => setNewPerkEn(e.target.value)}
                  placeholder={isAr ? 'الميزة بالإنجليزية (e.g. 10% pastry discount)' : 'New Perk in English'}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPerk}
                  className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addPerk')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-500">
            {isAr
              ? '💡 عند حفظ الإعدادات، يتم فوراً تحديث فئات جميع العملاء وتطبيق مضاعفات النقاط الجديدة.'
              : '💡 Saving tier configurations automatically recalculates all existing customer tiers and updates point multipliers.'}
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : t('saveTierConfig')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
