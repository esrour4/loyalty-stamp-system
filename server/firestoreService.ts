import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read firebase-applet-config.json safely
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    firebaseConfig = JSON.parse(raw);
  }
} catch (err) {
  console.error('[Server Firestore] Failed to load firebase-applet-config.json:', err);
}

const serverApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const serverDb = getFirestore(serverApp, firebaseConfig.firestoreDatabaseId);

export interface ServerMenuCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  order: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerMenuItem {
  id: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  currency?: string;
  isAvailable: boolean;
  image?: string;
  calories?: number;
  tag?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CATEGORIES: Omit<ServerMenuCategory, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat_hot_coffee',
    nameEn: 'Hot Specialty Coffee',
    nameAr: 'قهوة مختصة ساخنة',
    descriptionEn: 'Artisan hand-pulled espresso and specialty brewed hot beverages.',
    descriptionAr: 'مشروبات الإسبريسو والقهوة المختصة المحضرة بعناية يدوية.',
    order: 1,
    icon: 'coffee',
  },
  {
    id: 'cat_cold_brew',
    nameEn: 'Iced & Cold Brews',
    nameAr: 'مشروبات باردة وكولد برو',
    descriptionEn: 'Slow-steeped 18-hour cold brew and refreshing iced lattes.',
    descriptionAr: 'كولد برو منقوع 18 ساعة ومشروبات اللاتيه الباردة المنعشة.',
    order: 2,
    icon: 'cup-soda',
  },
  {
    id: 'cat_pastries',
    nameEn: 'Artisan Bakery & Pastries',
    nameAr: 'مخبوزات وحلويات طازجة',
    descriptionEn: 'Freshly baked Parisian croissants, brioche, and sweet treats.',
    descriptionAr: 'كرواسون باريسي بالزبدة، كعك، وحلويات محضرة يومياً.',
    order: 3,
    icon: 'croissant',
  },
  {
    id: 'cat_beans',
    nameEn: 'Single-Origin Reserve Beans',
    nameAr: 'محاصيل بن مختصة وحبوب',
    descriptionEn: 'Microlot beans roasted to perfection for home baristas.',
    descriptionAr: 'حبوب بن فاخرة من مزارع مختارة لتحضير قهوتك المفضلة بالمنزل.',
    order: 4,
    icon: 'package',
  },
];

const DEFAULT_ITEMS: Omit<ServerMenuItem, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'item_flat_white',
    categoryId: 'cat_hot_coffee',
    nameEn: 'Signature Flat White',
    nameAr: 'فلات وايت مميز',
    descriptionEn: 'Double ristretto with velvety microfoam and rich chocolate undertones.',
    descriptionAr: 'دبل ريستريتو مع حليب مبخر مخملي وإيحاءات الشوكولاتة الداكنة.',
    price: 32000,
    currency: 'SYP',
    isAvailable: true,
    calories: 130,
    tag: 'bestseller',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_spanish_latte',
    categoryId: 'cat_hot_coffee',
    nameEn: 'Spanish Honey Latte',
    nameAr: 'سبانش لاتيه بالعسل',
    descriptionEn: 'Sweetened condensed milk, espresso, and organic wildflower honey.',
    descriptionAr: 'إسبريسو فاخر مع حليب مكثف محلى وعسل الزهور البرية الطبيعي.',
    price: 35000,
    currency: 'SYP',
    isAvailable: true,
    calories: 210,
    tag: 'popular',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_v60_drip',
    categoryId: 'cat_hot_coffee',
    nameEn: 'V60 Ethiopian Yirgacheffe Drip',
    nameAr: 'قهوة مقطرة V60 إثيوبيا يرقاتشيف',
    descriptionEn: 'Hand-poured single origin with notes of bergamot, jasmine, and lemon zest.',
    descriptionAr: 'تقطير يدوي لمحصول إثيوبي فاخر مع إيحاءات البرغموت والياسمين وقشر الليمون.',
    price: 38000,
    currency: 'SYP',
    isAvailable: true,
    calories: 5,
    tag: 'signature',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_cold_brew',
    categoryId: 'cat_cold_brew',
    nameEn: '18-Hour Kyoto Cold Brew',
    nameAr: 'كولد برو كيوتو 18 ساعة',
    descriptionEn: 'Smooth, ultra-low acidity cold drip served over clear hand-cut ice.',
    descriptionAr: 'قهوة باردة مقطرة ببطء لمدة 18 ساعة مع حمضية منخفضة وثلج نقي.',
    price: 36000,
    currency: 'SYP',
    isAvailable: true,
    calories: 10,
    tag: 'signature',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_iced_pistachio',
    categoryId: 'cat_cold_brew',
    nameEn: 'Iced Pistachio Latte',
    nameAr: 'آيس بيستاشيو لاتيه',
    descriptionEn: 'Cold espresso swirled with real Bronte pistachio puree and creamy milk.',
    descriptionAr: 'إسبريسو مثلج ممزوج بكريمة الفستق الحلبي الطبيعي والحليب الطازج.',
    price: 42000,
    currency: 'SYP',
    isAvailable: true,
    calories: 260,
    tag: 'bestseller',
    image: 'https://images.unsplash.com/photo-1530373239216-42418aae5255?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_almond_croissant',
    categoryId: 'cat_pastries',
    nameEn: 'French Almond Butter Croissant',
    nameAr: 'كرواسون اللوز والزبدة الفرنسي',
    descriptionEn: 'Flaky artisanal croissant stuffed with rich almond frangipane and toasted slices.',
    descriptionAr: 'كرواسون فرنسي مقرمش محشو بكريمة اللوز ومغطى بشرائح اللوز المحمص.',
    price: 28000,
    currency: 'SYP',
    isAvailable: true,
    calories: 380,
    tag: 'popular',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_basque_cheesecake',
    categoryId: 'cat_pastries',
    nameEn: 'San Sebastián Burnt Cheesecake',
    nameAr: 'تشيز كيك سان سيباستيان المحروق',
    descriptionEn: 'Caramelized creamy Basque cheesecake with Madagascar vanilla bean.',
    descriptionAr: 'تشيز كيك باسكي كريمي مكرمل مع حبوب فانيلا مدغشقر الطبيعية.',
    price: 35000,
    currency: 'SYP',
    isAvailable: true,
    calories: 420,
    tag: 'signature',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_colombia_geisha',
    categoryId: 'cat_beans',
    nameEn: 'Colombia Huila Geisha (250g)',
    nameAr: 'بن كولومبيا هويلا غيشا (250 غرام)',
    descriptionEn: 'Light roasted whole beans with explosive peach, jasmine, and orange blossom notes.',
    descriptionAr: 'حبوب بن كاملة بتحميص خفيف نوتات الخوخ والياسمين وزهر البرتقال.',
    price: 180000,
    currency: 'SYP',
    isAvailable: true,
    calories: 0,
    tag: 'signature',
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Seed initial categories & items into Cloud Firestore if empty
 */
export async function seedMenuIfEmpty(): Promise<void> {
  try {
    const catCol = collection(serverDb, 'menu_categories');
    const catSnapshot = await getDocs(catCol);

    if (catSnapshot.empty) {
      console.log('[Firestore] Seeding default menu categories into persistent Cloud Firestore...');
      const now = new Date().toISOString();
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(serverDb, 'menu_categories', cat.id), {
          ...cat,
          createdAt: now,
          updatedAt: now,
        });
      }
      console.log(`[Firestore] Successfully seeded ${DEFAULT_CATEGORIES.length} categories.`);
    }

    const itemCol = collection(serverDb, 'menu_items');
    const itemSnapshot = await getDocs(itemCol);

    if (itemSnapshot.empty) {
      console.log('[Firestore] Seeding default menu items into persistent Cloud Firestore...');
      const now = new Date().toISOString();
      for (const item of DEFAULT_ITEMS) {
        await setDoc(doc(serverDb, 'menu_items', item.id), {
          ...item,
          createdAt: now,
          updatedAt: now,
        });
      }
      console.log(`[Firestore] Successfully seeded ${DEFAULT_ITEMS.length} menu items.`);
    }
  } catch (err) {
    console.error('[Firestore] Error during menu database auto-seed:', err);
  }
}

// ---------------- CATEGORY CRUD ----------------

export async function getCategories(): Promise<ServerMenuCategory[]> {
  try {
    const catCol = collection(serverDb, 'menu_categories');
    const q = query(catCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Auto seed if empty and re-fetch
      await seedMenuIfEmpty();
      const freshSnap = await getDocs(q);
      return freshSnap.docs.map((d) => d.data() as ServerMenuCategory);
    }

    return snapshot.docs.map((d) => d.data() as ServerMenuCategory);
  } catch (err) {
    console.error('[Firestore] Error fetching categories:', err);
    // Fallback if ordering index isn't ready
    const catCol = collection(serverDb, 'menu_categories');
    const snapshot = await getDocs(catCol);
    const list = snapshot.docs.map((d) => d.data() as ServerMenuCategory);
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  }
}

export async function addCategory(categoryData: Partial<ServerMenuCategory>): Promise<ServerMenuCategory> {
  const id = categoryData.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newCat: ServerMenuCategory = {
    id,
    nameEn: (categoryData.nameEn || '').trim() || 'Untitled Category',
    nameAr: (categoryData.nameAr || '').trim() || 'قسم بدون عنوان',
    descriptionEn: (categoryData.descriptionEn || '').trim(),
    descriptionAr: (categoryData.descriptionAr || '').trim(),
    order: Number(categoryData.order) || 1,
    icon: categoryData.icon || 'coffee',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(serverDb, 'menu_categories', id), newCat);
  console.log(`[Firestore] Category saved: ${id} (${newCat.nameEn})`);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<ServerMenuCategory>): Promise<ServerMenuCategory> {
  const catRef = doc(serverDb, 'menu_categories', id);
  const snap = await getDoc(catRef);
  if (!snap.exists()) {
    throw new Error(`Category with ID ${id} not found in Firestore.`);
  }

  const existing = snap.data() as ServerMenuCategory;
  const updated: ServerMenuCategory = {
    ...existing,
    ...updates,
    id, // Immutable ID
    updatedAt: new Date().toISOString(),
  };

  await setDoc(catRef, updated, { merge: true });
  console.log(`[Firestore] Category updated: ${id}`);
  return updated;
}

export async function deleteCategory(id: string): Promise<{ deleted: boolean; id: string }> {
  const catRef = doc(serverDb, 'menu_categories', id);
  await deleteDoc(catRef);

  // Also remove items belonging to this category to prevent orphaned data
  try {
    const itemCol = collection(serverDb, 'menu_items');
    const snap = await getDocs(itemCol);
    for (const d of snap.docs) {
      if (d.data().categoryId === id) {
        await deleteDoc(doc(serverDb, 'menu_items', d.id));
      }
    }
  } catch (err) {
    console.warn('[Firestore] Note on cascading item delete:', err);
  }

  console.log(`[Firestore] Category deleted: ${id}`);
  return { deleted: true, id };
}

// ---------------- MENU ITEM CRUD ----------------

export async function getMenuItems(): Promise<ServerMenuItem[]> {
  try {
    const itemCol = collection(serverDb, 'menu_items');
    const snapshot = await getDocs(itemCol);

    if (snapshot.empty) {
      await seedMenuIfEmpty();
      const freshSnap = await getDocs(itemCol);
      return freshSnap.docs.map((d) => d.data() as ServerMenuItem);
    }

    return snapshot.docs.map((d) => d.data() as ServerMenuItem);
  } catch (err) {
    console.error('[Firestore] Error fetching menu items:', err);
    throw err;
  }
}

export async function addMenuItem(itemData: Partial<ServerMenuItem>): Promise<ServerMenuItem> {
  const id = itemData.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newItem: ServerMenuItem = {
    id,
    categoryId: itemData.categoryId || 'cat_hot_coffee',
    nameEn: (itemData.nameEn || '').trim() || 'Untitled Item',
    nameAr: (itemData.nameAr || '').trim() || 'عنصر جديد',
    descriptionEn: (itemData.descriptionEn || '').trim(),
    descriptionAr: (itemData.descriptionAr || '').trim(),
    price: Math.max(0, Number(itemData.price) || 0),
    currency: itemData.currency || 'SYP',
    isAvailable: itemData.isAvailable !== false,
    image: itemData.image || '',
    calories: itemData.calories ? Number(itemData.calories) : undefined,
    tag: itemData.tag || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(serverDb, 'menu_items', id), newItem);
  console.log(`[Firestore] Menu item saved: ${id} (${newItem.nameEn})`);
  return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<ServerMenuItem>): Promise<ServerMenuItem> {
  const itemRef = doc(serverDb, 'menu_items', id);
  const snap = await getDoc(itemRef);
  if (!snap.exists()) {
    throw new Error(`Menu item with ID ${id} not found in Firestore.`);
  }

  const existing = snap.data() as ServerMenuItem;
  const updated: ServerMenuItem = {
    ...existing,
    ...updates,
    id, // Immutable ID
    price: updates.price !== undefined ? Math.max(0, Number(updates.price)) : existing.price,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(itemRef, updated, { merge: true });
  console.log(`[Firestore] Menu item updated: ${id}`);
  return updated;
}

export async function deleteMenuItem(id: string): Promise<{ deleted: boolean; id: string }> {
  const itemRef = doc(serverDb, 'menu_items', id);
  await deleteDoc(itemRef);
  console.log(`[Firestore] Menu item deleted: ${id}`);
  return { deleted: true, id };
}
