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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem } from '../../types';

interface CustomerMenuViewProps {
  onSelectItem?: (item: MenuItem) => void;
  compact?: boolean;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({ onSelectItem, compact = false }) => {
  const { language, settings, menuCategories, menuItems, loadingMenu } = useApp();
  const isAr = language === 'ar';

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCatId === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'كافة المشروبات' : 'All Drinks'}
          </button>
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCatId === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isAr ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن قهوتك...' : 'Search coffee...'}
            className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Item Grid */}
      {loadingMenu ? (
        <div className="p-8 text-center text-xs text-slate-500">
          {isAr ? 'جاري تحديث القائمة من Firestore...' : 'Fetching live menu...'}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          {isAr ? 'لا توجد مشروبات في هذا القسم' : 'No items found'}
        </div>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem && onSelectItem(item)}
              className={`p-3 rounded-2xl border transition flex gap-3 items-center bg-white dark:bg-slate-900 ${
                onSelectItem ? 'cursor-pointer hover:border-indigo-400 hover:shadow-xs' : ''
              } ${
                item.isAvailable
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-100 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-full h-full object-cover"
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                  </h4>
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-cyan-400 shrink-0">
                    {Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
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
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 ms-auto">
                    {item.isAvailable ? (isAr ? 'متوفر' : 'Available') : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
