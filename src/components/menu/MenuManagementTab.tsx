import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Trash2,
  Edit2,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Tag,
  Flame,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem } from '../../types';

export const MenuManagementTab: React.FC = () => {
  const {
    language,
    t,
    settings,
    menuCategories,
    menuItems,
    loadingMenu,
    addMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    refreshMenu,
  } = useApp();

  const isAr = language === 'ar';

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null);

  // Category Form State
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameAr, setCatNameAr] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catDescAr, setCatDescAr] = useState('');
  const [catOrder, setCatOrder] = useState<number>(1);
  const [catIcon, setCatIcon] = useState('coffee');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Item Form State
  const [itemCatId, setItemCatId] = useState('');
  const [itemNameEn, setItemNameEn] = useState('');
  const [itemNameAr, setItemNameAr] = useState('');
  const [itemDescEn, setItemDescEn] = useState('');
  const [itemDescAr, setItemDescAr] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemCurrency, setItemCurrency] = useState('SYP');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemImage, setItemImage] = useState('');
  const [itemCalories, setItemCalories] = useState<string>('');
  const [itemTag, setItemTag] = useState<string>('none');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMenu();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Open Category Modal
  const openCategoryModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatNameEn(cat.nameEn);
      setCatNameAr(cat.nameAr);
      setCatDescEn(cat.descriptionEn || '');
      setCatDescAr(cat.descriptionAr || '');
      setCatOrder(cat.order);
      setCatIcon(cat.icon || 'coffee');
    } else {
      setEditingCategory(null);
      setCatNameEn('');
      setCatNameAr('');
      setCatDescEn('');
      setCatDescAr('');
      setCatOrder(menuCategories.length + 1);
      setCatIcon('coffee');
    }
    setShowCategoryModal(true);
  };

  // Submit Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn.trim() && !catNameAr.trim()) return;

    try {
      setIsSubmittingCat(true);
      if (editingCategory) {
        await updateMenuCategory(editingCategory.id, {
          nameEn: catNameEn,
          nameAr: catNameAr,
          descriptionEn: catDescEn,
          descriptionAr: catDescAr,
          order: Number(catOrder),
          icon: catIcon,
        });
      } else {
        await addMenuCategory({
          nameEn: catNameEn,
          nameAr: catNameAr,
          descriptionEn: catDescEn,
          descriptionAr: catDescAr,
          order: Number(catOrder),
          icon: catIcon,
        });
      }
      setShowCategoryModal(false);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Open Item Modal
  const openItemModal = (item?: MenuItem) => {
    const defaultCat = menuCategories[0]?.id || '';
    if (item) {
      setEditingItem(item);
      setItemCatId(item.categoryId);
      setItemNameEn(item.nameEn);
      setItemNameAr(item.nameAr);
      setItemDescEn(item.descriptionEn || '');
      setItemDescAr(item.descriptionAr || '');
      setItemPrice(item.price);
      setItemCurrency(item.currency || settings.currency || 'SYP');
      setItemAvailable(item.isAvailable);
      setItemImage(item.image || '');
      setItemCalories(item.calories !== undefined ? String(item.calories) : '');
      setItemTag(item.tag || 'none');
    } else {
      setEditingItem(null);
      setItemCatId(selectedCategoryId !== 'all' ? selectedCategoryId : defaultCat);
      setItemNameEn('');
      setItemNameAr('');
      setItemDescEn('');
      setItemDescAr('');
      setItemPrice(30000);
      setItemCurrency(settings.currency || 'SYP');
      setItemAvailable(true);
      setItemImage('https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80');
      setItemCalories('');
      setItemTag('none');
    }
    setShowItemModal(true);
  };

  // Submit Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameEn.trim() && !itemNameAr.trim()) return;

    try {
      setIsSubmittingItem(true);
      const parsedCalories = itemCalories.trim() ? Number(itemCalories) : undefined;
      const tagVal = itemTag === 'none' ? undefined : itemTag;

      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          categoryId: itemCatId,
          nameEn: itemNameEn,
          nameAr: itemNameAr,
          descriptionEn: itemDescEn,
          descriptionAr: itemDescAr,
          price: Number(itemPrice),
          currency: itemCurrency,
          isAvailable: itemAvailable,
          image: itemImage,
          calories: parsedCalories,
          tag: tagVal,
        });
      } else {
        await addMenuItem({
          categoryId: itemCatId,
          nameEn: itemNameEn,
          nameAr: itemNameAr,
          descriptionEn: itemDescEn,
          descriptionAr: itemDescAr,
          price: Number(itemPrice),
          currency: itemCurrency,
          isAvailable: itemAvailable,
          image: itemImage,
          calories: parsedCalories,
          tag: tagVal,
        });
      }
      setShowItemModal(false);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    if (deletingTarget.type === 'category') {
      await deleteMenuCategory(deletingTarget.id);
      if (selectedCategoryId === deletingTarget.id) {
        setSelectedCategoryId('all');
      }
    } else {
      await deleteMenuItem(deletingTarget.id);
    }
    setDeletingTarget(null);
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Category match
    if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
      return false;
    }
    // Availability match
    if (availabilityFilter === 'available' && !item.isAvailable) return false;
    if (availabilityFilter === 'unavailable' && item.isAvailable) return false;

    // Search query match
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

  const inStockCount = menuItems.filter((i) => i.isAvailable).length;
  const outOfStockCount = menuItems.length - inStockCount;

  return (
    <div className="space-y-6">
      {/* 1. Firestore Cloud Database Header & Diagnostic Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-700/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Database className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
                Google Cloud Firestore
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isAr ? 'متصل ومتزامن' : 'Live & Synchronized'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              {isAr ? 'قاعدة بيانات قائمة المشروبات والمأكولات السحابية' : 'Persistent Cloud Firestore Menu System'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {isAr
                ? 'يتم تخزين كافة أقسام وعناصر القائمة مباشرة في Google Cloud Firestore. البيانات دائمة ومحفوظة بالكامل ولن تُفقد عند إعادة تشغيل الحاوية أو السيرفر.'
                : 'All menu categories, artisan brews, and food items are persisted directly in Google Cloud Firestore collections. Data is fully retained across container redeployments and restarts.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="refresh-menu-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing || loadingMenu}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700 text-white text-xs font-bold border border-indigo-500/30 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loadingMenu ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAr ? 'تحديث من السحابة' : 'Re-sync Firestore'}</span>
            </button>

            <button
              type="button"
              id="add-category-btn"
              onClick={() => openCategoryModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 transition shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'إضافة قسم جديد' : 'New Category'}</span>
            </button>

            <button
              type="button"
              id="add-item-btn"
              onClick={() => openItemModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مشروب / وجبة' : 'Add Menu Item'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-800/40">
          <div className="bg-indigo-950/40 p-3 rounded-2xl border border-indigo-800/30">
            <span className="text-[10px] text-slate-400 block font-semibold">{isAr ? 'إجمالي الأقسام' : 'Categories'}</span>
            <span className="text-lg font-black text-white">{menuCategories.length}</span>
          </div>
          <div className="bg-indigo-950/40 p-3 rounded-2xl border border-indigo-800/30">
            <span className="text-[10px] text-slate-400 block font-semibold">{isAr ? 'عناصر القائمة' : 'Menu Items'}</span>
            <span className="text-lg font-black text-white">{menuItems.length}</span>
          </div>
          <div className="bg-indigo-950/40 p-3 rounded-2xl border border-indigo-800/30">
            <span className="text-[10px] text-emerald-400 block font-semibold">{isAr ? 'متوفر للطلب' : 'In Stock'}</span>
            <span className="text-lg font-black text-emerald-400">{inStockCount}</span>
          </div>
          <div className="bg-indigo-950/40 p-3 rounded-2xl border border-indigo-800/30">
            <span className="text-[10px] text-amber-400 block font-semibold">{isAr ? 'غير متوفر مؤقتاً' : 'Out of Stock'}</span>
            <span className="text-lg font-black text-amber-400">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Categories Overview & Horizontal Pills */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {isAr ? 'أقسام القائمة المسجلة في Firestore' : 'Categories in Firestore'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="text-xs text-indigo-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'قسم إضافي' : 'Add Category'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedCategoryId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span>{isAr ? 'الكل' : 'All Items'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {menuItems.length}
            </span>
          </button>

          {menuCategories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                className={`group flex items-center rounded-2xl border transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="px-3.5 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <Coffee className="w-3.5 h-3.5 opacity-80" />
                  <span>{isAr ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
                    {count}
                  </span>
                </button>

                {/* Edit & Delete Action Buttons inside Category Pill */}
                <div className="flex items-center pe-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCategoryModal(cat);
                    }}
                    className={`p-1 rounded-md transition ${isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-indigo-600'}`}
                    title={isAr ? 'تعديل القسم' : 'Edit Category'}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTarget({
                        type: 'category',
                        id: cat.id,
                        name: isAr ? cat.nameAr || cat.nameEn : cat.nameEn,
                      });
                    }}
                    className={`p-1 rounded-md transition ${isSelected ? 'text-white hover:bg-red-400/40' : 'text-slate-400 hover:text-red-500'}`}
                    title={isAr ? 'حذف القسم' : 'Delete Category'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو الوصف...' : 'Search coffee, pastry, beans...'}
            className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                availabilityFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isAr ? 'كل الحالات' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isAr ? 'المتوفر' : 'In Stock'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                availabilityFilter === 'unavailable'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>{isAr ? 'النافذ' : 'Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Menu Items Grid */}
      {loadingMenu ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'جاري تحميل قائمة المنتجات من Firestore...' : 'Syncing menu catalog with Google Cloud Firestore...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400 mx-auto flex items-center justify-center mb-3">
            <Coffee className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {isAr ? 'لا توجد عناصر تطابق بحثك' : 'No menu items found'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {isAr
              ? 'يمكنك إضافة مشروبات وحلويات جديدة وحفظها في قاعدة البيانات السحابية.'
              : 'Add delicious specialty coffee or fresh bakery items to your Cloud Firestore menu database.'}
          </p>
          <button
            type="button"
            onClick={() => openItemModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة عنصر جديد الآن' : 'Create First Item'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const category = menuCategories.find((c) => c.id === item.categoryId);
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition shadow-xs flex flex-col overflow-hidden relative group ${
                  item.isAvailable
                    ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    : 'border-amber-200/80 dark:border-amber-900/40 opacity-75'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback image if broken link
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Coffee className="w-12 h-12 stroke-[1.2]" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5 flex-wrap">
                    {item.tag && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                        {item.tag}
                      </span>
                    )}
                    {item.calories !== undefined && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 text-slate-200 text-[10px] font-mono backdrop-blur-xs flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        {item.calories} kcal
                      </span>
                    )}
                  </div>

                  {/* Top Right Availability Badge */}
                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5">
                    <button
                      type="button"
                      onClick={() => toggleMenuItemAvailability(item.id, !item.isAvailable)}
                      title={isAr ? 'اضغط لتبديل حالة التوفر' : 'Click to toggle availability'}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-xs transition cursor-pointer ${
                        item.isAvailable
                          ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                          : 'bg-amber-600/95 text-white hover:bg-amber-700'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? 'متوفر' : 'In Stock'}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>{isAr ? 'نفذت الكمية' : 'Sold Out'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Category Pill Over Image */}
                  <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
                    <span className="text-[10px] font-bold text-white/90 bg-slate-950/60 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                      {category ? (isAr ? category.nameAr || category.nameEn : category.nameEn) : 'Beverage'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr}
                      </h4>
                      <span className="text-sm font-mono font-black text-indigo-600 dark:text-cyan-400 whitespace-nowrap">
                        {Number(item.price).toLocaleString()} {item.currency || settings.currency || 'SYP'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr}
                    </p>
                  </div>

                  {/* Footer Controls: Availability Toggle & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={(e) => toggleMenuItemAvailability(item.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 relative" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {item.isAvailable ? (isAr ? 'متاح للطلب' : 'Available') : (isAr ? 'غير متوفر' : 'Unavailable')}
                      </span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openItemModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title={isAr ? 'تعديل الصنف' : 'Edit item'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeletingTarget({
                            type: 'item',
                            id: item.id,
                            name: isAr ? item.nameAr || item.nameEn : item.nameEn,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title={isAr ? 'حذف الصنف' : 'Delete item'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. ADD / EDIT CATEGORY MODAL                         */}
      {/* ==================================================== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingCategory
                    ? (isAr ? 'تعديل قسم القائمة' : 'Edit Menu Category')
                    : (isAr ? 'إضافة قسم جديد في Firestore' : 'Add Category to Firestore')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم القسم (بالعربية) *' : 'Category Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  placeholder="مثال: قهوة مختصة ساخنة"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم القسم (بالإنجليزية) *' : 'Category Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  placeholder="e.g. Hot Specialty Coffee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'ترتيب الظهور (رقم)' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'أيقونة القسم' : 'Icon'}
                  </label>
                  <select
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="coffee">☕ Coffee</option>
                    <option value="cup-soda">🥤 Cold Brew / Soda</option>
                    <option value="croissant">🥐 Bakery / Croissant</option>
                    <option value="package">📦 Whole Bean Box</option>
                    <option value="sparkles">✨ Specialty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={catDescAr}
                  onChange={(e) => setCatDescAr(e.target.value)}
                  placeholder="وصف مختصر للقسم..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الوصف بالإنجليزية' : 'Description (English)'}
                </label>
                <textarea
                  rows={2}
                  value={catDescEn}
                  onChange={(e) => setCatDescEn(e.target.value)}
                  placeholder="Short description in English..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmittingCat ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ القسم' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. ADD / EDIT MENU ITEM MODAL                        */}
      {/* ==================================================== */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingItem
                    ? (isAr ? 'تعديل بيانات المشروب / الوجبة' : 'Edit Menu Item in Firestore')
                    : (isAr ? 'إضافة مشروب أو وجبة جديدة' : 'Add Item to Firestore Menu')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'القسم التابع له *' : 'Menu Category *'}
                </label>
                <select
                  required
                  value={itemCatId}
                  onChange={(e) => setItemCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                >
                  {menuCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isAr ? c.nameAr || c.nameEn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={itemNameAr}
                    onChange={(e) => setItemNameAr(e.target.value)}
                    placeholder="مثال: سبانش لاتيه"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم بالإنجليزية *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={itemNameEn}
                    onChange={(e) => setItemNameEn(e.target.value)}
                    placeholder="e.g. Spanish Latte"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'السعر *' : 'Price *'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'العملة' : 'Currency'}
                  </label>
                  <input
                    type="text"
                    value={itemCurrency}
                    onChange={(e) => setItemCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Image URL & Quick Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'رابط الصورة (Image URL)' : 'Image URL'}
                </label>
                <input
                  type="url"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">{isAr ? 'اقتراحات سريعة:' : 'Sample links:'}</span>
                  {[
                    { name: 'Latte', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Flat White', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Cold Brew', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setItemImage(s.url)}
                      className="text-[10px] text-indigo-600 dark:text-cyan-400 underline font-semibold"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag & Calories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'شارة مميزة (Tag)' : 'Special Badge'}
                  </label>
                  <select
                    value={itemTag}
                    onChange={(e) => setItemTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="none">{isAr ? 'بدون شارة' : 'None'}</option>
                    <option value="bestseller">{isAr ? 'الأكثر طلباً (Bestseller)' : 'Bestseller'}</option>
                    <option value="signature">{isAr ? 'توقيع المقهى (Signature)' : 'Signature'}</option>
                    <option value="popular">{isAr ? 'شائع (Popular)' : 'Popular'}</option>
                    <option value="new">{isAr ? 'جديد (New)' : 'New'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'السعرات الحرارية (kcal)' : 'Calories (kcal)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={itemCalories}
                    onChange={(e) => setItemCalories(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={itemDescAr}
                    onChange={(e) => setItemDescAr(e.target.value)}
                    placeholder="تفاصيل المكونات أو الإيحاءات..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الوصف بالإنجليزية' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={itemDescEn}
                    onChange={(e) => setItemDescEn(e.target.value)}
                    placeholder="Tasting notes and ingredients..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Availability checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isAr ? 'جاهز ومتوفر للطلب الآن' : 'In-Stock & Ready to Order'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isAr ? 'إذا تم إلغاء التحديد سيظهر للعملاء كـ "غير متوفر"' : 'Customers will see it marked as sold out'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={itemAvailable}
                  onChange={(e) => setItemAvailable(e.target.checked)}
                  className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isSubmittingItem
                    ? (isAr ? 'جاري الحفظ في Firestore...' : 'Saving to Firestore...')
                    : isAr
                    ? 'حفظ الصنف في السحابة'
                    : 'Save Item to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. DELETE CONFIRMATION MODAL                         */}
      {/* ==================================================== */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isAr ? 'تأكيد الحذف من السحابة؟' : 'Confirm Firestore Deletion?'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr ? (
                  <>
                    هل أنت متأكد من رغبتك في حذف <strong className="text-slate-900 dark:text-slate-100">{deletingTarget.name}</strong>؟
                    {deletingTarget.type === 'category' && ' سيتم حذف جميع المشروبات التابعة لهذا القسم تلقائياً.'}
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">{deletingTarget.name}</strong> from Cloud Firestore?
                    {deletingTarget.type === 'category' && ' All items linked to this category will also be removed.'}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
              >
                {isAr ? 'نعم، احذف نهائياً' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
