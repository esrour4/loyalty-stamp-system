import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  Coffee,
  DollarSign,
  Edit2,
  Gift,
  HelpCircle,
  Minus,
  Percent,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useApp, DEFAULT_WHEEL_SECTORS } from '../../context/AppContext';
import { WheelSector, WheelSettings } from '../../types';

const COLOR_PRESETS = [
  '#b45309', // Amber 700
  '#d97706', // Amber 600
  '#78350f', // Amber 900
  '#92400e', // Amber 800
  '#f59e0b', // Amber 500
  '#57534e', // Stone 600 (Lose)
  '#44403c', // Stone 700 (Lose)
  '#78716c', // Stone 500 (Lose)
  '#047857', // Emerald 700
  '#0f766e', // Teal 700
  '#be123c', // Rose 700
  '#4338ca', // Indigo 700
];

export const WheelSettingsTab: React.FC = () => {
  const { settings, updateSettings, language, triggerToast } = useApp();
  const isAr = language === 'ar';

  const initialWheelConfig: WheelSettings = settings.wheel || {
    enabled: true,
    spinsPerDay: 1,
    sectors: DEFAULT_WHEEL_SECTORS,
  };

  const [enabled, setEnabled] = useState(initialWheelConfig.enabled);
  const [spinsPerDay, setSpinsPerDay] = useState(initialWheelConfig.spinsPerDay || 1);
  const [sectors, setSectors] = useState<WheelSector[]>(
    initialWheelConfig.sectors && initialWheelConfig.sectors.length > 0
      ? initialWheelConfig.sectors
      : DEFAULT_WHEEL_SECTORS
  );

  // Sector Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [sectorLabelEn, setSectorLabelEn] = useState('');
  const [sectorLabelAr, setSectorLabelAr] = useState('');
  const [sectorType, setSectorType] = useState<'points' | 'stamp' | 'coupon' | 'lose'>('points');
  const [sectorValue, setSectorValue] = useState<string | number>('50');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_item'>('percentage');
  const [sectorColor, setSectorColor] = useState('#d97706');
  const [isWinning, setIsWinning] = useState(true);

  const openAddModal = () => {
    setEditingSectorId(null);
    setSectorLabelEn('');
    setSectorLabelAr('');
    setSectorType('points');
    setSectorValue('50');
    setDiscountType('percentage');
    setSectorColor('#d97706');
    setIsWinning(true);
    setModalOpen(true);
  };

  const openEditModal = (sector: WheelSector) => {
    setEditingSectorId(sector.id);
    setSectorLabelEn(sector.labelEn);
    setSectorLabelAr(sector.labelAr);
    setSectorType(sector.type);
    setSectorValue(sector.value ?? '');
    setDiscountType(sector.discountType || 'percentage');
    setSectorColor(sector.color || '#d97706');
    setIsWinning(sector.isWinning);
    setModalOpen(true);
  };

  const handleSectorTypeChange = (type: 'points' | 'stamp' | 'coupon' | 'lose') => {
    setSectorType(type);
    if (type === 'lose') {
      setIsWinning(false);
      setSectorValue(0);
      if (!sectorLabelEn && !sectorLabelAr) {
        setSectorLabelEn('Better Luck Next Time');
        setSectorLabelAr('حظ أوفر المرة القادمة');
      }
      setSectorColor('#57534e');
    } else {
      setIsWinning(true);
      if (type === 'points') {
        setSectorValue(50);
        setSectorColor('#d97706');
        if (!sectorLabelEn || sectorLabelEn === 'Better Luck Next Time') {
          setSectorLabelEn('50 Points');
          setSectorLabelAr('50 نقطة');
        }
      } else if (type === 'stamp') {
        setSectorValue(1);
        setSectorColor('#f59e0b');
        if (!sectorLabelEn || sectorLabelEn === 'Better Luck Next Time') {
          setSectorLabelEn('+1 Free Stamp');
          setSectorLabelAr('+1 ختم مجاني');
        }
      } else if (type === 'coupon') {
        setSectorValue('Free Croissant');
        setDiscountType('free_item');
        setSectorColor('#b45309');
        if (!sectorLabelEn || sectorLabelEn === 'Better Luck Next Time') {
          setSectorLabelEn('Free Croissant');
          setSectorLabelAr('كرواسون مجاني');
        }
      }
    }
  };

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorLabelAr.trim() && !sectorLabelEn.trim()) return;

    const finalSector: WheelSector = {
      id: editingSectorId || 'sec_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      labelEn: sectorLabelEn.trim() || sectorLabelAr.trim(),
      labelAr: sectorLabelAr.trim() || sectorLabelEn.trim(),
      type: sectorType,
      value: sectorType === 'lose' ? 0 : sectorValue,
      discountType: sectorType === 'coupon' ? discountType : undefined,
      color: sectorColor,
      isWinning: sectorType === 'lose' ? false : isWinning,
    };

    if (editingSectorId) {
      setSectors((prev) => prev.map((s) => (s.id === editingSectorId ? finalSector : s)));
      triggerToast(isAr ? 'تم تعديل القطاع بنجاح' : 'Sector updated', 'success');
    } else {
      setSectors((prev) => [...prev, finalSector]);
      triggerToast(isAr ? 'تمت إضافة القطاع بنجاح' : 'Sector added', 'success');
    }

    setModalOpen(false);
  };

  const handleDeleteSector = (id: string) => {
    if (sectors.length <= 4) {
      triggerToast(
        isAr
          ? 'يجب أن تحتوي عجلة الحظ على 4 قطاعات على الأقل'
          : 'Wheel must have at least 4 sectors',
        'warning'
      );
      return;
    }
    setSectors((prev) => prev.filter((s) => s.id !== id));
    triggerToast(isAr ? 'تم حذف القطاع' : 'Sector removed', 'info');
  };

  const handleResetDefaults = () => {
    setSectors(DEFAULT_WHEEL_SECTORS);
    setSpinsPerDay(1);
    setEnabled(true);
    triggerToast(
      isAr ? 'تمت استعادة إعدادات عجلة الحظ الافتراضية' : 'Default wheel sectors restored',
      'info'
    );
  };

  const handleSaveAllSettings = () => {
    const updatedWheel: WheelSettings = {
      enabled,
      spinsPerDay: Math.max(1, spinsPerDay),
      sectors,
    };

    updateSettings({ wheel: updatedWheel });
    triggerToast(
      isAr ? 'تم حفظ إعدادات عجلة الحظ والجوائز بنجاح!' : 'Fortune Wheel settings saved successfully!',
      'success'
    );
  };

  const winningCount = sectors.filter((s) => s.isWinning).length;
  const losingCount = sectors.filter((s) => !s.isWinning).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Main Toggle */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{isAr ? 'عجلة الحظ والمكافآت الترويجية' : 'Daily Fortune Wheel & Prize Config'}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    enabled
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300'
                      : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border-stone-300'
                  }`}
                >
                  {enabled ? (isAr ? 'مفعلة' : 'Active') : (isAr ? 'معطلة' : 'Disabled')}
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
                {isAr
                  ? 'يمكنك تفعيل أو إيقاف عجلة الحظ في أي وقت، وتحديد عدد مرات التدوير المسموحة لكل عميل في اليوم الواحد، مع إمكانية إضافة قطاعات فوز بجوائز وقطاعات حظ أوفر (خسارة).'
                  : 'Enable or disable the Fortune Wheel at any time, set the daily spin limits per customer, and configure winning prizes as well as losing sectors.'}
              </p>
            </div>
          </div>

          {/* Enable / Disable Switch */}
          <div className="flex items-center gap-4 self-end lg:self-auto bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="text-right">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                {isAr ? 'حالة العجلة' : 'Wheel Status'}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {enabled ? (isAr ? 'ظاهرة للعملاء' : 'Visible to customers') : (isAr ? 'مخفية مؤقتاً' : 'Hidden from customers')}
              </span>
            </div>
            <button
              type="button"
              id="toggle-wheel-enabled-btn"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                enabled ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  enabled ? (isAr ? '-translate-x-6' : 'translate-x-6') : (isAr ? '-translate-x-1' : 'translate-x-1')
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Control Grid: Spins Limit & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spins Limit Card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 mb-1">
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-bold">
                {isAr ? 'عدد مرات التدوير اليومية' : 'Daily Spins Per Customer'}
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              {isAr
                ? 'كم مرة يمكن للعميل تدوير العجلة خلال اليوم الواحد (24 ساعة).'
                : 'Maximum spins allowed per customer per calendar day.'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpinsPerDay((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max="20"
                value={spinsPerDay}
                onChange={(e) => setSpinsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-extrabold text-sm text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={() => setSpinsPerDay((prev) => prev + 1)}
                className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {spinsPerDay} {isAr ? (spinsPerDay === 1 ? 'تدويرة / يوم' : 'تدويرات / يوم') : 'spins / day'}
            </span>
          </div>
        </div>

        {/* Winning Sectors Breakdown */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 mb-1">
              <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold">{isAr ? 'قطاعات الفوز (الجوائز)' : 'Winning Sectors'}</h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isAr
                ? 'نقاط إضافية، أختام مجانية، كوبونات خصم ومشروبات مجانية.'
                : 'Points, bonus stamps, discount coupons and free items.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{winningCount}</span>
            <span className="text-xs text-stone-400">
              {sectors.length > 0 ? Math.round((winningCount / sectors.length) * 100) : 0}% {isAr ? 'نسبة الفوز' : 'Win Rate'}
            </span>
          </div>
        </div>

        {/* Losing Sectors Breakdown */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 mb-1">
              <Coffee className="w-4 h-4 text-stone-500" />
              <h4 className="text-xs font-bold">{isAr ? 'قطاعات الحظ الأوفر (خسارة)' : 'Losing / Try Again Sectors'}</h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isAr
                ? 'خيارات لا تقدم جائزة مثل "حظ أوفر المرة القادمة" أو "جرّب غداً".'
                : 'Non-winning slices to balance odds and create excitement.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-2xl font-black text-stone-600 dark:text-stone-300">{losingCount}</span>
            <span className="text-xs text-stone-400">
              {sectors.length > 0 ? Math.round((losingCount / sectors.length) * 100) : 0}% {isAr ? 'نسبة الحظ الأوفر' : 'Loss Rate'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Wheel Management & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Interactive Visual Wheel Preview (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'معاينة العجلة الحية' : 'Live Wheel Preview'}</span>
          </h4>
          <p className="text-[11px] text-stone-400 mb-4">
            {isAr ? `تتكون العجلة حالياً من ${sectors.length} قطاعات` : `Wheel currently has ${sectors.length} sectors`}
          </p>

          {/* SVG Visualizer */}
          <div className="relative w-52 h-52 my-2 flex items-center justify-center">
            {/* Top Pointer */}
            <div className="absolute -top-2 z-30 transform -translate-x-1/2 left-1/2">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-500 drop-shadow-md" />
            </div>

            <svg viewBox="0 0 200 200" className="w-full h-full rounded-full shadow-lg">
              <g transform="translate(100, 100)">
                {sectors.map((sector, i) => {
                  const numSectors = sectors.length;
                  const angle = 360 / numSectors;
                  const startAngle = (i * angle * Math.PI) / 180;
                  const endAngle = ((i + 1) * angle * Math.PI) / 180;
                  const x1 = 98 * Math.cos(startAngle);
                  const y1 = 98 * Math.sin(startAngle);
                  const x2 = 98 * Math.cos(endAngle);
                  const y2 = 98 * Math.sin(endAngle);

                  const midAngleRad = (i * angle + angle / 2) * (Math.PI / 180);
                  const textX = 58 * Math.cos(midAngleRad);
                  const textY = 58 * Math.sin(midAngleRad);

                  return (
                    <g key={sector.id || i}>
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 98 98 0 0 1 ${x2} ${y2} Z`}
                        fill={sector.color || '#78350f'}
                        stroke="#1c130e"
                        strokeWidth="1.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize={numSectors > 8 ? '5.5' : '6.5'}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${i * angle + angle / 2}, ${textX}, ${textY})`}
                      >
                        {isAr ? sector.labelAr : sector.labelEn}
                      </text>
                    </g>
                  );
                })}
                {/* Center Cap */}
                <circle r="20" fill="#1c130e" stroke="#fbbf24" strokeWidth="2" />
                <circle r="7" fill="#fbbf24" />
              </g>
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {winningCount} {isAr ? 'جوائز فوز' : 'Winning'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold border border-stone-200 dark:border-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              {losingCount} {isAr ? 'حظ أوفر' : 'Losing'}
            </span>
          </div>
        </div>

        {/* Right / Bottom: Sectors List & Management (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {isAr ? 'قطاعات عجلة الحظ الحالية' : 'Wheel Sectors & Prize List'}
              </h4>
              <p className="text-xs text-stone-400">
                {isAr
                  ? 'قم بإضافة أو تعديل القطاعات لتخصيص الهدايا ونسب الفوز والخسارة.'
                  : 'Add or modify sectors to customize prizes and odds.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="reset-default-sectors-btn"
                onClick={handleResetDefaults}
                className="px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 transition flex items-center gap-1"
                title={isAr ? 'استعادة الإعدادات الافتراضية' : 'Reset to default sectors'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
              </button>

              <button
                type="button"
                id="add-wheel-sector-btn"
                onClick={openAddModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة قطاع جديد' : 'Add New Sector'}</span>
              </button>
            </div>
          </div>

          {/* Sectors Grid / List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {sectors.map((sector, index) => {
              const isWin = sector.isWinning;
              return (
                <div
                  key={sector.id || index}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between gap-3 hover:border-amber-300 dark:hover:border-amber-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Sector Color Indicator */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 text-xs font-black shadow-xs"
                      style={{ backgroundColor: sector.color || '#78350f' }}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {isAr ? sector.labelAr : sector.labelEn}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            isWin
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {isWin ? (isAr ? 'فوز' : 'Win') : (isAr ? 'حظ أوفر' : 'Lose')}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                        {sector.type === 'points' && `⭐ ${sector.value} ${isAr ? 'نقطة' : 'Pts'}`}
                        {sector.type === 'stamp' && `☕ +${sector.value || 1} ${isAr ? 'ختم' : 'Stamp'}`}
                        {sector.type === 'coupon' && `🎁 ${sector.value || 'Coupon'}`}
                        {sector.type === 'lose' && `🍂 ${isAr ? 'بدون جائزة' : 'No Prize'}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(sector)}
                      className="p-1.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                      title={isAr ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSector(sector.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Changes Bar */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {isAr
                ? 'تأكد من الضغط على حفظ لتطبيق التغييرات لجميع رواد المقهى.'
                : 'Click save to apply all changes across customer apps.'}
            </span>

            <button
              type="button"
              id="save-wheel-settings-btn"
              onClick={handleSaveAllSettings}
              className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ إعدادات عجلة الحظ' : 'Save Wheel Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Sector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>
                  {editingSectorId
                    ? isAr
                      ? 'تعديل قطاع عجلة الحظ'
                      : 'Edit Wheel Sector'
                    : isAr
                    ? 'إضافة قطاع جديد لعجلة الحظ'
                    : 'Add New Wheel Sector'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSector} className="space-y-4">
              {/* Type Selector (Points, Stamp, Coupon, Lose) */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  {isAr ? 'نوع القطاع والنتيجة' : 'Sector Type & Outcome'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: 'points', labelAr: '⭐ نقاط مكافأة', labelEn: '⭐ Points', icon: Star },
                    { type: 'stamp', labelAr: '☕ ختم إضافي', labelEn: '☕ Stamp', icon: Coffee },
                    { type: 'coupon', labelAr: '🎁 كوبون هدية', labelEn: '🎁 Coupon', icon: Gift },
                    { type: 'lose', labelAr: '🍂 حظ أوفر (خسارة)', labelEn: '🍂 Lose / Try Again', icon: RotateCcw },
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleSectorTypeChange(t.type as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition ${
                        sectorType === t.type
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <span>{isAr ? t.labelAr : t.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arabic & English Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {isAr ? 'الاسم على العجلة (بالعربية)' : 'Sector Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={sectorLabelAr}
                    onChange={(e) => setSectorLabelAr(e.target.value)}
                    placeholder={isAr ? 'مثال: 50 نقطة، حظ أوفر، كرواسون' : 'e.g. 50 نقطة'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {isAr ? 'الاسم على العجلة (بالإنجليزية)' : 'Sector Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={sectorLabelEn}
                    onChange={(e) => setSectorLabelEn(e.target.value)}
                    placeholder="e.g. 50 Points, Try Again, Free Croissant"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Value / Specific Options based on type */}
              {sectorType === 'points' && (
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {isAr ? 'عدد النقاط الممنوحة' : 'Points Amount'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sectorValue}
                    onChange={(e) => setSectorValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              {sectorType === 'stamp' && (
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {isAr ? 'عدد الأختام الإضافية' : 'Stamps Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={sectorValue}
                    onChange={(e) => setSectorValue(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              {sectorType === 'coupon' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {isAr ? 'نوع الكوبون' : 'Coupon Type'}
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                    >
                      <option value="free_item">{isAr ? 'صنف أو مشروب مجاني' : 'Free Item / Beverage'}</option>
                      <option value="percentage">{isAr ? 'نسبة خصم مئوية (%)' : 'Percentage Discount (%)'}</option>
                      <option value="fixed">{isAr ? 'خصم مبلغ ثابت' : 'Fixed Discount Amount'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {isAr ? 'القيمة / الصنف' : 'Value / Item Name'}
                    </label>
                    <input
                      type="text"
                      value={sectorValue}
                      onChange={(e) => setSectorValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? '20' : 'Free Croissant'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              )}

              {/* Color Presets */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  {isAr ? 'لون القطاع' : 'Sector Color'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSectorColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        sectorColor === color
                          ? 'scale-110 border-stone-900 dark:border-white shadow-md'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={sectorColor}
                    onChange={(e) => setSectorColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    title={isAr ? 'اختر لوناً مخصصاً' : 'Custom color'}
                  />
                </div>
              </div>

              {/* Win / Lose Badge Confirmation */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600 dark:text-stone-300">
                  {isAr ? 'تصنيف النتيجة:' : 'Outcome Classification:'}
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    sectorType === 'lose'
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {sectorType === 'lose'
                    ? isAr
                      ? '🍂 خيار حظ أوفر (خسارة)'
                      : '🍂 Lose (No Prize)'
                    : isAr
                    ? '🎁 خيار فوز (جائزة فورية)'
                    : '🎁 Winning Prize'}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-xs cursor-pointer"
                >
                  {isAr ? 'تأكيد وحفظ القطاع' : 'Confirm & Save Sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
