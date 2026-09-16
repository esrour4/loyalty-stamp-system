import { MenuCategory, MenuItem } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface MenuApiResponse<T> {
  success: boolean;
  categories?: MenuCategory[];
  category?: MenuCategory;
  items?: MenuItem[];
  item?: MenuItem;
  error?: string;
  id?: string;
}

export const MenuService = {
  // 1. Fetch all categories from Firestore
  async fetchCategories(): Promise<MenuCategory[]> {
    try {
      const res = await fetch('/api/menu/categories');
      if (res.ok) {
        const data: MenuApiResponse<MenuCategory> = await res.json();
        if (data.success && data.categories) {
          return data.categories;
        }
      }
      throw new Error('Backend API returned non-success response');
    } catch (apiErr) {
      console.warn('[MenuService] API failed, attempting direct Firestore query:', apiErr);
      try {
        const snap = await getDocs(collection(db, 'menu_categories'));
        const list = snap.docs.map((d) => d.data() as MenuCategory);
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        return list;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.LIST, 'menu_categories');
      }
    }
  },

  // 2. Add category to Firestore
  async addCategory(cat: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuCategory> {
    try {
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add category');
      }
      return data.category;
    } catch (apiErr) {
      console.warn('[MenuService] API add failed, attempting direct Firestore write:', apiErr);
      const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newCat: MenuCategory = { ...cat, id, createdAt: now, updatedAt: now };
      try {
        await setDoc(doc(db, 'menu_categories', id), newCat);
        return newCat;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `menu_categories/${id}`);
      }
    }
  },

  // 3. Update category in Firestore
  async updateCategory(id: string, updates: Partial<MenuCategory>): Promise<MenuCategory> {
    try {
      const res = await fetch(`/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update category');
      }
      return data.category;
    } catch (apiErr) {
      console.warn('[MenuService] API update failed, attempting direct Firestore write:', apiErr);
      const updated = { ...updates, id, updatedAt: new Date().toISOString() };
      try {
        await setDoc(doc(db, 'menu_categories', id), updated, { merge: true });
        return updated as MenuCategory;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.UPDATE, `menu_categories/${id}`);
      }
    }
  },

  // 4. Delete category in Firestore
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category');
      }
      return true;
    } catch (apiErr) {
      console.warn('[MenuService] API delete failed, attempting direct Firestore delete:', apiErr);
      try {
        await deleteDoc(doc(db, 'menu_categories', id));
        return true;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.DELETE, `menu_categories/${id}`);
      }
    }
  },

  // 5. Fetch all menu items from Firestore
  async fetchMenuItems(): Promise<MenuItem[]> {
    try {
      const res = await fetch('/api/menu/items');
      if (res.ok) {
        const data: MenuApiResponse<MenuItem> = await res.json();
        if (data.success && data.items) {
          return data.items;
        }
      }
      throw new Error('Backend API returned non-success response');
    } catch (apiErr) {
      console.warn('[MenuService] API fetch failed, attempting direct Firestore query:', apiErr);
      try {
        const snap = await getDocs(collection(db, 'menu_items'));
        return snap.docs.map((d) => d.data() as MenuItem);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.LIST, 'menu_items');
      }
    }
  },

  // 6. Add menu item to Firestore
  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const res = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add menu item');
      }
      return data.item;
    } catch (apiErr) {
      console.warn('[MenuService] API add failed, attempting direct Firestore write:', apiErr);
      const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newItem: MenuItem = { ...item, id, createdAt: now, updatedAt: now };
      try {
        await setDoc(doc(db, 'menu_items', id), newItem);
        return newItem;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `menu_items/${id}`);
      }
    }
  },

  // 7. Update menu item in Firestore
  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update menu item');
      }
      return data.item;
    } catch (apiErr) {
      console.warn('[MenuService] API update failed, attempting direct Firestore write:', apiErr);
      const updated = { ...updates, id, updatedAt: new Date().toISOString() };
      try {
        await setDoc(doc(db, 'menu_items', id), updated, { merge: true });
        return updated as MenuItem;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.UPDATE, `menu_items/${id}`);
      }
    }
  },

  // 8. Delete menu item in Firestore
  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete menu item');
      }
      return true;
    } catch (apiErr) {
      console.warn('[MenuService] API delete failed, attempting direct Firestore delete:', apiErr);
      try {
        await deleteDoc(doc(db, 'menu_items', id));
        return true;
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.DELETE, `menu_items/${id}`);
      }
    }
  },

  // 9. Trigger initial seed
  async seedMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const res = await fetch('/api/menu/seed', { method: 'POST' });
    const data = await res.json();
    return {
      categories: data.categories || [],
      items: data.items || [],
    };
  },
};
