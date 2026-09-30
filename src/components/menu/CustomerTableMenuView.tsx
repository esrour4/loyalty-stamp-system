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
  LayoutGrid,
  List,
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
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'list'>('card');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [showTrayModal, setShowTrayModal] = useState<boolean>(false);
  const [showOrderSummaryBarcode, setShowOrderSummaryBarcode] = useState<boolean>(false);

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCatId !== 'all' && item.categoryId !== selectedCatId) return false;
    if (inStockOnly && !item.isAvailable) return false;
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
      {/* 1. Top Cafe Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/30">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Cafe Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  {isAr ? 'القائمة الرقمية' : 'Digital Menu'}
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400 font-semibold bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? 'متصل ومباشر' : 'Live Menu'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {isAr ? settings.shopNameAr : settings.shopNameEn}
              </h1>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                {isAr ? settings.sloganAr : settings.sloganEn}
              </p>
            </div>

            {/* Quick Actions: Wi-Fi & Loyalty Pass */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end pt-1 sm:pt-0">
              {settings.wifiName && (
                <div className="flex items-center gap-1.5 bg-indigo-950/70 px-2.5 py-1.5 rounded-xl border border-indigo-800/40 text-[11px] text-slate-200">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-mono font-bold">{settings.wifiName}</span>
                </div>
              )}

              <button
                type="button"
                id="menu-open-member-card-btn"
                onClick={() => setRole('customer')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'بطاقة الولاء' : 'Stamp Pass'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Menu Container */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4">
        {/* Sticky Category Horizontal Strip & Mobile Search */}
        <div className="sticky top-14 sm:top-16 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
          {/* Category Horizontal Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedCatId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 border ${
                selectedCatId === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{isAr ? 'الكل' : 'All Items'}</span>
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 border flex items-center gap-1.5 ${
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

          {/* Search Bar & Quick Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث في المشروبات والمأكولات...' : 'Search drinks, bakery & coffee...'}
                className="w-full ps-9 pe-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              {/* In Stock Filter */}
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  inStockOnly
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{isAr ? 'المتوفر فقط' : 'In Stock'}</span>
              </button>

              {/* View Switcher for mobile */}
              <div className="flex sm:hidden items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('card')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    mobileViewMode === 'card'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={isAr ? 'عرض بطاقات' : 'Card View'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    mobileViewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={isAr ? 'عرض قائمة' : 'List View'}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Items Catalog Grid / Mobile List */}
        {loadingMenu ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {isAr ? 'جاري تحميل قائمة المقهى...' : 'Syncing live menu...'}
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
          <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {filteredItems.map((item) => {
              const inTrayCount = tableTray.find((t) => t.item.id === item.id)?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border transition shadow-xs overflow-hidden relative ${
                    item.isAvailable
                      ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      : 'border-slate-100 dark:border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* MOBILE COMPACT ROW VIEW (< sm) */}
                  <div className="p-3 flex sm:hidden items-center justify-between gap-3">
                    {/* Thumbnail */}
                    <div
                      onClick={() => setSelectedItemDetail(item)}
                      className="relative w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer"
                    >
                      {item.image && item.image.trim() !== '' ? (
                        <img
                          src={item.image.trim()}
                          alt={item.nameEn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Coffee className="w-8 h-8" />
                        </div>
                      )}
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <span className="text-[9px] font-black text-amber-300 uppercase tracking-tight">
                            {isAr ? 'نافذ' : 'Sold Out'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0" onClick={() => setSelectedItemDetail(item)}>
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 cursor-pointer">
                          {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-black text-indigo-600 dark:text-cyan-400 block mb-1">
                        {Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                        {isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr}
                      </p>
                      {item.calories !== undefined && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-1">
                          <Flame className="w-2.5 h-2.5 text-amber-500" />
                          {item.calories} kcal
                        </span>
                      )}
                    </div>

                    {/* Right Action: Add / Stepper */}
                    <div className="shrink-0">
                      {item.isAvailable ? (
                        inTrayCount === 0 ? (
                          <button
                            type="button"
                            onClick={() => addToTableTray(item, 1)}
                            className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-cyan-300 dark:hover:text-white flex items-center justify-center shadow-xs transition active:scale-90 cursor-pointer"
                            title={isAr ? 'إضافة للطلب' : 'Add to Order'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center bg-indigo-600 text-white rounded-xl p-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateTableTrayItemQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-1.5 text-xs font-mono font-bold">
                              {inTrayCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToTableTray(item, 1)}
                              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-amber-500">
                          {isAr ? 'نافذ' : 'Out'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DESKTOP / TABLET CARD VIEW (>= sm) */}
                  <div className="hidden sm:flex flex-col h-full">
                    {/* Item Image with Fallback */}
                    <div
                      className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group"
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

                      {/* Bottom Action: Add to Order */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        {item.isAvailable ? (
                          inTrayCount === 0 ? (
                            <button
                              type="button"
                              onClick={() => addToTableTray(item, 1)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-cyan-300 dark:hover:text-white text-xs font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isAr ? 'إضافة للطلب' : 'Add to Order'}</span>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Floating Basket Bar (Optimized for Mobile Thumb Zone) */}
      {totalTrayCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-4 z-40 max-w-lg mx-auto">
          <div className="bg-slate-900/95 dark:bg-slate-900 text-white p-3 sm:p-3.5 px-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-500/50 backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs sm:text-sm shadow-md">
                {totalTrayCount}
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-semibold leading-none">
                  {isAr ? 'سلة طلباتك' : 'Your Order'}
                </span>
                <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono mt-0.5 block">
                  {totalTrayPrice.toLocaleString()} {settings.currency || 'SYP'}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="view-table-tray-btn"
              onClick={() => setShowTrayModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAr ? 'عرض الطلب للباريستا' : 'Show to Barista'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Order Tray Bottom Sheet (Mobile-First) */}
      {showTrayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
            {/* Modal Drag Indicator for Mobile */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'سلة طلباتي' : 'My Order Tray'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAr ? 'اعرض هذا الطلب للباريستا عند الكاونتر' : 'Present this to your barista at the counter'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrayModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tray Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
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
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-500 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateTableTrayItemQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-indigo-600 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromTableTray(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg active:scale-90"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3 pb-safe">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isAr ? 'إجمالي الطلب المقدر:' : 'Estimated Order Total:'}</span>
                <span className="text-base font-black font-mono text-indigo-600 dark:text-cyan-400">
                  {totalTrayPrice.toLocaleString()} {settings.currency || 'SYP'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-cyan-200">
                ☕ {isAr
                  ? 'اعرض شاشة هاتفك للباريستا عند الكاونتر لتسجيل طلبك وإضافة أختام الولاء فوراً.'
                  : 'Show your phone screen to the barista to place this order & collect stamps.'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearTableTray();
                    setShowTrayModal(false);
                    triggerToast(isAr ? 'تم إفراغ سلة الطلبات' : 'Order basket cleared', 'info');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-red-500 active:scale-95"
                >
                  {isAr ? 'إفراغ' : 'Clear'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTrayModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
                >
                  {isAr ? 'تم • العودة للقائمة' : 'Done • Back to Menu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Item Detail Bottom Sheet (Mobile-First) */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            {/* Mobile Drag Pill */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="relative h-44 sm:h-48 w-full bg-slate-100 dark:bg-slate-800 shrink-0">
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

            <div className="p-5 space-y-3 overflow-y-auto">
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
                <span className="text-base font-mono font-black text-indigo-600 dark:text-cyan-400 shrink-0">
                  {Number(selectedItemDetail.price).toLocaleString()} {selectedItemDetail.currency || settings.currency || 'SYP'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? selectedItemDetail.descriptionAr || selectedItemDetail.descriptionEn
                  : selectedItemDetail.descriptionEn || selectedItemDetail.descriptionAr}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 pb-safe">
                {selectedItemDetail.isAvailable ? (
                  <button
                    type="button"
                    onClick={() => {
                      addToTableTray(selectedItemDetail, 1);
                      setSelectedItemDetail(null);
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة للطلب' : 'Add to Order'}</span>
                  </button>
                ) : (
                  <div className="text-center py-2.5 text-xs font-bold text-amber-500">
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
