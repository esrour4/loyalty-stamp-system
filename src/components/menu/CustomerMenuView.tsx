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
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  X,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem } from '../../types';

interface CustomerMenuViewProps {
  onSelectItem?: (item: MenuItem) => void;
  compact?: boolean;
  showBasket?: boolean;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  onSelectItem,
  compact = false,
  showBasket = true,
}) => {
  const {
    language,
    settings,
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
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [showBasketModal, setShowBasketModal] = useState<boolean>(false);
  const [showTablePicker, setShowTablePicker] = useState<boolean>(false);
  const [customTableInput, setCustomTableInput] = useState<string>('');

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

  const totalBasketCount = tableTray.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalBasketPrice = tableTray.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const tableQuickList = [
    'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
    'Table 6', 'Table 7', 'Table 8', 'Bar Counter', 'Terrace 1',
    isAr ? 'سفري / Takeaway' : 'Takeaway / To-Go'
  ];

  return (
    <div className="space-y-4 relative">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{isAr ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Basket Mini Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن قهوة أو حلى...' : 'Search coffee, bakery...'}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {showBasket && totalBasketCount > 0 && (
            <button
              type="button"
              onClick={() => setShowBasketModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition"
              title={isAr ? 'عرض سلة الطلبات' : 'View Basket'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{totalBasketCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Item Grid */}
      {loadingMenu ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Coffee className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <span>{isAr ? 'جاري تحديث القائمة من Firestore...' : 'Fetching live menu from Firestore...'}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          {isAr ? 'لا توجد أصناف في هذا القسم' : 'No menu items found'}
        </div>
      ) : (
        <div className={`grid gap-3.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredItems.map((item) => {
            const inTrayItem = tableTray.find((t) => t.item.id === item.id);
            const inTrayQty = inTrayItem?.quantity || 0;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between bg-white dark:bg-slate-900 ${
                  item.isAvailable
                    ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      if (onSelectItem) onSelectItem(item);
                      else setSelectedItemDetail(item);
                    }}
                    className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative cursor-pointer group"
                  >
                    {item.image && item.image.trim() !== '' ? (
                      <img
                        src={item.image.trim()}
                        alt={item.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Coffee className="w-6 h-6" />
                      </div>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-tighter">
                          {isAr ? 'نافذ' : 'Sold Out'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <h4
                        onClick={() => {
                          if (onSelectItem) onSelectItem(item);
                          else setSelectedItemDetail(item);
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                      >
                        {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                      </h4>
                      <span className="text-xs font-mono font-black text-indigo-600 dark:text-cyan-400 shrink-0">
                        {Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {item.tag && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 uppercase">
                          {item.tag}
                        </span>
                      )}
                      {item.calories !== undefined && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-amber-500" />
                          {item.calories} kcal
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="text-[9px] font-bold text-amber-500 ms-auto">
                          {isAr ? 'غير متوفر' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Basket Action Button / Stepper */}
                {showBasket && item.isAvailable && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {inTrayQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToTableTray(item, 1)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-cyan-300 dark:hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إضافة للسلة' : 'Add to Basket'}</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between bg-indigo-600 text-white rounded-xl p-0.5 px-2 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateTableTrayItemQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold">
                          {inTrayQty} {isAr ? 'في السلة' : 'in basket'}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToTableTray(item, 1)}
                          className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Basket Drawer Bar */}
      {showBasket && totalBasketCount > 0 && (
        <div className="sticky bottom-3 z-30 pt-2 animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900/95 dark:bg-slate-900 text-white p-3 px-4 rounded-2xl shadow-xl border border-indigo-500/40 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                {totalBasketCount}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold leading-none">
                  {currentTable || (isAr ? 'طلب طاولة / سفري' : 'Order Basket')}
                </span>
                <span className="text-xs font-black text-cyan-300 font-mono">
                  {totalBasketPrice.toLocaleString()} {settings.currency || 'SYP'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBasketModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض السلة والطلب' : 'View Basket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basket Summary & Show-to-Barista Modal */}
      {showBasketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'سلة الطلبات' : 'Order Basket'}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    <span>{currentTable || (isAr ? 'لم يتم تحديد طاولة' : 'No Table Selected')}</span>
                    <button
                      type="button"
                      onClick={() => setShowTablePicker(true)}
                      className="text-indigo-600 dark:text-cyan-400 font-bold underline ms-1"
                    >
                      {isAr ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBasketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {tableTray.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {isAr ? 'السلة فارغة حالياً' : 'Your basket is currently empty'}
                </div>
              ) : (
                tableTray.map(({ item, quantity }) => (
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
                        title={isAr ? 'حذف' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {tableTray.length > 0 && (
              <div className="p-4 px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{isAr ? 'إجمالي الطلب المقدر:' : 'Estimated Order Total:'}</span>
                  <span className="text-base font-black font-mono text-indigo-600 dark:text-cyan-400">
                    {totalBasketPrice.toLocaleString()} {settings.currency || 'SYP'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-cyan-200">
                  ☕ {isAr
                    ? `الموقع: (${currentTable || 'طلب كاونتر'}). اعرض هذه الشاشة للباريستا لتجهيز طلبك وإضافة أختام الولاء فوراً.`
                    : `Seated: ${currentTable || 'Counter Order'}. Show this screen to the barista to place your order & collect stamps.`}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearTableTray();
                      setShowBasketModal(false);
                      triggerToast(isAr ? 'تم إفراغ سلة الطلبات' : 'Basket cleared', 'info');
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-red-500"
                  >
                    {isAr ? 'إفراغ' : 'Clear'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBasketModal(false)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {isAr ? 'تم • العودة للقائمة' : 'Done • Back to Menu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Picker Modal */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'تحديد رقم الطاولة أو سفري' : 'Select Table or Takeaway'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTablePicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {tableQuickList.map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => {
                    setCurrentTable(tbl);
                    setShowTablePicker(false);
                    triggerToast(isAr ? `تم تعيين ${tbl}` : `Set to ${tbl}`, 'success');
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
                  {isAr ? 'حفظ وتأكيد' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
              {selectedItemDetail.image && selectedItemDetail.image.trim() !== '' ? (
                <img
                  src={selectedItemDetail.image.trim()}
                  alt={selectedItemDetail.nameEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Coffee className="w-10 h-10" />
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

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isAr ? selectedItemDetail.nameAr || selectedItemDetail.nameEn : selectedItemDetail.nameEn || selectedItemDetail.nameAr}
                  </h3>
                  {selectedItemDetail.calories !== undefined && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {selectedItemDetail.calories} kcal
                    </span>
                  )}
                </div>
                <span className="text-sm font-mono font-black text-indigo-600 dark:text-cyan-400">
                  {Number(selectedItemDetail.price).toLocaleString()} {selectedItemDetail.currency || settings.currency || 'SYP'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? selectedItemDetail.descriptionAr || selectedItemDetail.descriptionEn
                  : selectedItemDetail.descriptionEn || selectedItemDetail.descriptionAr}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
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
                    <span>{isAr ? 'إضافة إلى سلة الطلبات' : 'Add to Order Basket'}</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-amber-500">
                    {isAr ? 'هذا الصنف غير متوفر حالياً' : 'Sold out temporarily'}
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
