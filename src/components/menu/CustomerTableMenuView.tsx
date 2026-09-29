import React, { useState } from 'react';
import {
  Coffee,
  Search,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Wifi,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Smartphone,
  MapPin,
  RefreshCw,
  ExternalLink,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem } from '../../types';

export const CustomerTableMenuView: React.FC = () => {
  const {
    settings,
    language,
    t,
    menuCategories,
    menuItems,
    loadingMenu,
    currentTable,
    setCurrentTable,
    tableTray,
    addToTableTray,
    updateTableTrayItemQty,
    removeFromTableTray,
    clearTableTray,
    setRole,
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';

  // Filters & State
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [showTrayModal, setShowTrayModal] = useState<boolean>(false);
  const [showTablePicker, setShowTablePicker] = useState<boolean>(false);
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [showOrderSummaryBarcode, setShowOrderSummaryBarcode] = useState<boolean>(false);

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCatId !== 'all' && item.categoryId !== selectedCatId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameEn = item.nameEn.toLowerCase().includes(q);
      const matchNameAr = item.nameAr.toLowerCase().includes(q);
      const matchDescEn = (item.descriptionEn || '').toLowerCase().includes(q);
      const matchDescAr = (item.descriptionAr || '').toLowerCase().includes(q);
      return matchNameEn || matchNameAr || matchDescEn || matchDescAr;
    }
    return true;
  });

  // Calculate Tray Totals
  const totalTrayCount = tableTray.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalTrayPrice = tableTray.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  // Quick table options
  const tableQuickList = [
    'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
    'Table 6', 'Table 7', 'Table 8', 'Bar Counter', 'Terrace 1'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
      {/* 1. Top Cafe Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/30">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Cafe Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  {isAr ? 'القائمة الرقمية الحية' : 'Live Digital Menu'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? 'متصل بـ Firestore' : 'Firestore Realtime'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isAr ? settings.shopNameAr : settings.shopNameEn}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl">
                {isAr ? settings.sloganAr : settings.sloganEn}
              </p>
            </div>

            {/* Table Badge & Switcher */}
            <div className="flex items-center gap-2 bg-indigo-900/40 p-2 sm:p-2.5 rounded-2xl border border-indigo-700/40 backdrop-blur-xs self-start sm:self-auto">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left rtl:text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none">
                    {isAr ? 'موقع جلوسك' : 'Your Table'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {currentTable || (isAr ? 'طاولة الضيوف' : 'Guest Table')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="switch-table-btn"
                onClick={() => setShowTablePicker(true)}
                className="ms-2 px-2.5 py-1 text-[11px] font-bold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition cursor-pointer"
              >
                {isAr ? 'تغيير' : 'Change'}
              </button>
            </div>
          </div>

          {/* Wi-Fi & Loyalty Helper Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-indigo-900/40 text-xs text-slate-300">
            {settings.wifiName && (
              <div className="flex items-center gap-2 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-800/30">
                <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Wi-Fi: <strong className="text-white font-mono">{settings.wifiName}</strong></span>
                {settings.wifiPassword && (
                  <span className="text-slate-400 font-mono">({settings.wifiPassword})</span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setRole('customer')}
              className="flex items-center justify-between bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/40 hover:border-cyan-500 text-cyan-300 font-bold transition cursor-pointer text-left rtl:text-right"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'لديك حساب ولاء؟ اجمع أختامك اليوم' : 'Loyalty Member? Tap for Stamp Pass'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Menu Container */}
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Category Horizontal Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-16 z-20 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCatId('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                selectedCatId === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{isAr ? 'كافة الأصناف' : 'All Items'}</span>
              <span className="ms-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
                {menuItems.length}
              </span>
            </button>

            {menuCategories.map((cat) => {
              const count = menuItems.filter((i) => i.categoryId === cat.id).length;
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5 opacity-70" />
                  <span>{isAr ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن قهوة أو حلى...' : 'Search drinks, bakery...'}
              className="w-full ps-8 pe-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* 3. Items Catalog Grid */}
        {loadingMenu ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {isAr ? 'جاري تحميل قائمة المقهى من السحابة...' : 'Syncing live menu from Cloud Firestore...'}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <Coffee className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {isAr ? 'لم يتم العثور على نتائج في هذا القسم' : 'No menu items match your search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const inTrayCount = tableTray.find((t) => t.item.id === item.id)?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border transition shadow-xs flex flex-col overflow-hidden relative group ${
                    item.isAvailable
                      ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      : 'border-amber-200/80 dark:border-amber-900/40 opacity-75'
                  }`}
                >
                  {/* Item Image with Fallback */}
                  <div
                    className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItemDetail(item)}
                  >
                    {item.image && item.image.trim() !== '' ? (
                      <img
                        src={item.image.trim()}
                        alt={item.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Coffee className="w-10 h-10" />
                      </div>
                    )}

                    {/* Tag badge */}
                    {item.tag && item.tag !== 'none' && (
                      <div className="absolute top-2.5 start-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                          {item.tag}
                        </span>
                      </div>
                    )}

                    {/* Stock Status */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40">
                          {isAr ? 'نافذ مؤقتاً' : 'Sold Out'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => setSelectedItemDetail(item)}
                          className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                        >
                          {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                        </h3>
                        <span className="text-xs font-mono font-black text-indigo-600 dark:text-cyan-400 shrink-0">
                          {Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr}
                      </p>

                      {/* Nutritional info */}
                      {item.calories !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{item.calories} kcal</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Add to Table Tray */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      {item.isAvailable ? (
                        inTrayCount === 0 ? (
                          <button
                            type="button"
                            onClick={() => addToTableTray(item, 1)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-cyan-300 dark:hover:text-white text-xs font-bold transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إضافة إلى طلب الطاولة' : 'Add to Table Tray'}</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-indigo-600 text-white rounded-xl p-1 px-2 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateTableTrayItemQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold">
                              {inTrayCount} {isAr ? 'في السلة' : 'in tray'}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToTableTray(item, 1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="w-full text-center text-xs font-bold text-amber-600 dark:text-amber-400 py-1.5">
                          {isAr ? 'غير متوفر حالياً' : 'Currently Unavailable'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Floating On-Table Tray Bar */}
      {totalTrayCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div className="bg-slate-900/95 dark:bg-slate-900 text-white p-3.5 px-4 rounded-3xl shadow-2xl border border-indigo-500/40 backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                {totalTrayCount}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">
                  {currentTable || (isAr ? 'طاولة الضيوف' : 'Table Order')}
                </span>
                <span className="text-sm font-black text-cyan-300">
                  {totalTrayPrice.toLocaleString()} {settings.currency || 'SYP'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="view-table-tray-btn"
                onClick={() => setShowTrayModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض الطلب للباريستا' : 'Show to Barista'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Order Tray & Show-to-Barista Modal */}
      {showTrayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'سلة طلبات الطاولة' : 'Table Order Summary'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    📍 {currentTable || 'Table 1'} • {isAr ? 'اعرضها للباريستا عند الطلب' : 'Present this to your barista'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrayModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tray Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {tableTray.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 font-bold">
                      {(item.price * quantity).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateTableTrayItemQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateTableTrayItemQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-indigo-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromTableTray(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Action Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isAr ? 'إجمالي الطلب المقدر:' : 'Estimated Table Bill:'}</span>
                <span className="text-base font-black font-mono text-indigo-600 dark:text-cyan-400">
                  {totalTrayPrice.toLocaleString()} {settings.currency || 'SYP'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-cyan-200">
                ☕ {isAr
                  ? `أنت جالس على (${currentTable || 'طاولة الضيوف'}). اعرض شاشة الهاتف للباريستا عند الكاونتر لتسجيل طلبك وإضافة أختام الولاء فوراً.`
                  : `Seated at ${currentTable || 'Guest Table'}. Show your phone screen to the barista to place this order & collect stamps.`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearTableTray();
                    setShowTrayModal(false);
                    triggerToast(isAr ? 'تم إفراغ سلة الطلبات' : 'Table tray cleared', 'info');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-red-500"
                >
                  {isAr ? 'إفراغ' : 'Clear'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTrayModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'تم • العودة للقائمة' : 'Done • Back to Menu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Switch Table Modal */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'تحديد رقم الطاولة' : 'Select Your Table'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTablePicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {isAr
                ? 'إذا انتقلت لطاولة أخرى، اختر رقم طاولتك الحالية لربط طلبك بها:'
                : 'Select the table where you are seated:'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {tableQuickList.map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => {
                    setCurrentTable(tbl);
                    setShowTablePicker(false);
                    triggerToast(isAr ? `تم تعيين ${tbl}` : `Table set to ${tbl}`, 'success');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    currentTable === tbl
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                value={customTableInput}
                onChange={(e) => setCustomTableInput(e.target.value)}
                placeholder={isAr ? 'أو اكتب رقم طاولة أخرى...' : 'Or enter custom table...'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs mb-2"
              />
              {customTableInput.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTable(customTableInput.trim());
                    setShowTablePicker(false);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  {isAr ? 'حفظ وتأكيد' : 'Confirm Custom Table'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
              {selectedItemDetail.image && selectedItemDetail.image.trim() !== '' ? (
                <img
                  src={selectedItemDetail.image.trim()}
                  alt={selectedItemDetail.nameEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Coffee className="w-12 h-12" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 end-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                    {isAr ? selectedItemDetail.nameAr || selectedItemDetail.nameEn : selectedItemDetail.nameEn || selectedItemDetail.nameAr}
                  </h3>
                  {selectedItemDetail.calories !== undefined && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {selectedItemDetail.calories} kcal
                    </span>
                  )}
                </div>
                <span className="text-base font-mono font-black text-indigo-600 dark:text-cyan-400">
                  {Number(selectedItemDetail.price).toLocaleString()} {selectedItemDetail.currency || settings.currency || 'SYP'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? selectedItemDetail.descriptionAr || selectedItemDetail.descriptionEn
                  : selectedItemDetail.descriptionEn || selectedItemDetail.descriptionAr}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {selectedItemDetail.isAvailable ? (
                  <button
                    type="button"
                    onClick={() => {
                      addToTableTray(selectedItemDetail, 1);
                      setSelectedItemDetail(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة إلى طلب الطاولة' : 'Add to Table Tray'}</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-amber-500">
                    {isAr ? 'هذا العنصر غير متوفر حالياً' : 'Sold out temporarily'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
