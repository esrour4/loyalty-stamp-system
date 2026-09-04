import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Barista,
  BroadcastNotification,
  Coupon,
  Customer,
  Language,
  RewardItem,
  StoreSettings,
  SurveyFeedback,
  TierConfig,
  TierLevel,
  Transaction,
  UserRole,
  WhatsAppLog,
  WheelSector,
  WheelSettings,
} from '../types';
import { translations } from '../i18n/translations';
import { ZenderSendResult, ZenderService } from '../services/zenderService';

export const DEFAULT_WHEEL_SECTORS: WheelSector[] = [
  {
    id: 'sec_1',
    labelEn: 'Free Butter Croissant',
    labelAr: 'كرواسون زبدة مجاني',
    type: 'coupon',
    value: 'Free Croissant',
    discountType: 'free_item',
    color: '#b45309',
    isWinning: true,
  },
  {
    id: 'sec_2',
    labelEn: 'Better Luck Next Time',
    labelAr: 'حظ أوفر المرة القادمة',
    type: 'lose',
    value: 0,
    color: '#57534e',
    isWinning: false,
  },
  {
    id: 'sec_3',
    labelEn: '50 Bonus Points',
    labelAr: '50 نقطة إضافية',
    type: 'points',
    value: 50,
    color: '#d97706',
    isWinning: true,
  },
  {
    id: 'sec_4',
    labelEn: 'Try Again Tomorrow',
    labelAr: 'جرّب حظك غداً',
    type: 'lose',
    value: 0,
    color: '#44403c',
    isWinning: false,
  },
  {
    id: 'sec_5',
    labelEn: 'Free Extra Shot',
    labelAr: 'شوت إضافي مجاني',
    type: 'coupon',
    value: 'Free Shot',
    discountType: 'free_item',
    color: '#92400e',
    isWinning: true,
  },
  {
    id: 'sec_6',
    labelEn: 'A Warm Smile! 😊',
    labelAr: 'ابتسامة وقهوة طيبة 😊',
    type: 'lose',
    value: 0,
    color: '#78716c',
    isWinning: false,
  },
  {
    id: 'sec_7',
    labelEn: '+1 Bonus Stamp',
    labelAr: '+1 ختم إضافي',
    type: 'stamp',
    value: 1,
    color: '#f59e0b',
    isWinning: true,
  },
  {
    id: 'sec_8',
    labelEn: '20% Off Latte',
    labelAr: 'خصم 20% على اللاتيه',
    type: 'coupon',
    value: 20,
    discountType: 'percentage',
    color: '#78350f',
    isWinning: true,
  },
];

const DEFAULT_SETTINGS: StoreSettings = {
  shopNameEn: 'Roast & Bloom Coffee Co.',
  shopNameAr: 'محمصة و مقهى روزت آند بلوم - دمشق',
  sloganEn: 'Artisan Specialty Coffee & Stamp Rewards',
  sloganAr: 'قهوة مختصة مميزة وبرنامج مكافآت الأختام الرقمي',
  logoIcon: 'coffee',
  currency: 'SYP',
  stampsForFreeDrink: 8,
  pointsPerStamp: 10,
  pointsPerCurrencyUnit: 1,
  stampIcon: 'cup',
  theme: {
    primary: '#78350f', // warm roast
    accent: '#d97706',  // caramel amber
    background: '#fafaf9',
    cardBg: '#ffffff',
    textColor: '#1c1917',
    preset: 'caramel',
  },
  zender: {
    apiUrl: 'https://zender.sms/api/send/whatsapp',
    apiKey: 'zen_live_9a7bc21fe8430e',
    whatsappDeviceId: 'dev_roast_bloom_01',
    enabled: true,
    welcomeTemplate: '☕ مرحباً بك يا {customer_name} في برنامج ولاء {shop_name}!\n\nتم اعتماد وتفعيل بطاقتك الرقمية رقم ({card_number}) بنجاح.\n\n🔗 رابط بطاقتك ودخول حسابك المباشر:\n{login_link}\n\nاجمع 8 أختام واحصل على مشروبك القادم مجاناً!',
    stampAddedTemplate: '☕ أهلاً {customer_name}! تمت إضافة {stamps_added} ختم جديد لبطاقتك في {shop_name}. رصيدك الحالي: {stamps_count}/8 أختام. بقي قليل لمشروبك المجاني!',
    rewardRedeemedTemplate: '🎉 ألف مبروك {customer_name}! تم استبدال مكافأتك ({reward_name}) بنجاح في {shop_name}. نتمنى لك وقتاً ممتعاً!',
    birthdayTemplate: '🎂 كل عام وأنت بخير يا {customer_name}! بمناسبة شهر ميلادك، هدية مشروبك المميز وقطعة الحلى مجاناً بانتظارك في {shop_name}!',
    promoTemplate: '✨ عرض خاص من {shop_name}! ساعات الذروة الذهبية: احصل على ختمين إضافيين مع كل كوب قهوة اليوم حتى الساعة 8 مساءً.',
  },
  wheel: {
    enabled: true,
    spinsPerDay: 1,
    sectors: DEFAULT_WHEEL_SECTORS,
  },
  referralRewardStamps: 2,
  surveyRewardPoints: 25,
  birthdayRewardFreeDrink: true,
  ownerPin: '1234',
};

export const DEFAULT_TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  bronze: {
    id: 'bronze',
    nameEn: 'Bronze Roaster',
    nameAr: 'المحمص البرونزي',
    minPoints: 0,
    multiplier: 1.0,
    color: '#b45309',
    perksEn: ['1x Points on drinks', 'Standard digital stamp card', 'Birthday beverage gift'],
    perksAr: ['1x نقاط على المشروبات', 'بطاقة أختام رقمية', 'مشروب هدية في عيد الميلاد'],
  },
  silver: {
    id: 'silver',
    nameEn: 'Silver Barista',
    nameAr: 'الباريستا الفضي',
    minPoints: 100,
    multiplier: 1.25,
    color: '#94a3b8',
    perksEn: ['1.25x Points multiplier', 'Free flavour syrup upgrade', '10% Pastry discount'],
    perksAr: ['1.25x مضاعفة النقاط', 'إضافة نكهة سيروب مجانية', 'خصم 10% على المخبوزات'],
  },
  gold: {
    id: 'gold',
    nameEn: 'Gold Connoisseur',
    nameAr: 'خبير القهوة الذهبي',
    minPoints: 300,
    multiplier: 1.5,
    color: '#eab308',
    perksEn: ['1.5x Points multiplier', 'Free extra espresso shot anytime', 'Priority counter queue', 'Free monthly pastry'],
    perksAr: ['1.5x مضاعفة النقاط', 'شوت إسبريسو إضافي مجاناً دائماً', 'أولوية بالطلب', 'قطعة حلى شهرية مجاناً'],
  },
  platinum: {
    id: 'platinum',
    nameEn: 'Platinum Master',
    nameAr: 'الماستر البلاتيني',
    minPoints: 600,
    multiplier: 2.0,
    color: '#6366f1',
    perksEn: ['2.0x Double Points', 'Exclusive single-origin reserve tastings', 'Free barista masterclass', 'Personalized custom tumbler'],
    perksAr: ['2.0x نقاط مضاعفة', 'تذوق مجاني لمحاصيل القهوة المختصة النادرة', 'ورشة عمل باريستا مجانية', 'كوب حافظ مخصص باسمك'],
  },
};

export const TIER_CONFIGS = DEFAULT_TIER_CONFIGS;

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    cardNumber: 'COFFEE-1001',
    name: 'سارة العلي (Sara Al-Ali)',
    phone: '+963944112233',
    dateOfBirth: '1995-09-04', // Today matches demo birthday!
    status: 'approved',
    currentStamps: 7, // 1 away from 8!
    totalStampsCollected: 23,
    totalPoints: 380,
    tier: 'gold',
    referralCode: 'SARA99',
    referralCount: 4,
    joinedAt: '2026-01-15T10:00:00Z',
    lastVisitAt: '2026-09-02T16:30:00Z',
    coupons: [
      {
        id: 'cp_1',
        code: 'WHEEL-LATTE-20',
        titleEn: '20% Off Spanish Latte',
        titleAr: 'خصم 20% على سبانش لاتيه',
        discountType: 'percentage',
        discountValue: 20,
        expiresAt: '2026-09-20',
        used: false,
        source: 'wheel',
      },
    ],
  },
  {
    id: 'cust_2',
    cardNumber: 'COFFEE-2045',
    name: 'خالد المنصور (Khalid Al-Mansoor)',
    phone: '+963933445566',
    dateOfBirth: '1992-11-20',
    status: 'approved',
    currentStamps: 3,
    totalStampsCollected: 11,
    totalPoints: 140,
    tier: 'silver',
    referralCode: 'KHALID20',
    referralCount: 1,
    joinedAt: '2026-03-10T12:00:00Z',
    lastVisitAt: '2026-08-28T09:15:00Z',
    coupons: [],
  },
  {
    id: 'cust_3',
    cardNumber: 'COFFEE-9812',
    name: 'نور الشامي (Nour Al-Shami)',
    phone: '+963955667788',
    dateOfBirth: '1998-05-14',
    status: 'pending', // Pending barista/owner approval!
    currentStamps: 0,
    totalStampsCollected: 0,
    totalPoints: 20,
    tier: 'bronze',
    referralCode: 'NOUF98',
    referredBy: 'SARA99',
    referralCount: 0,
    joinedAt: '2026-09-04T13:20:00Z',
    coupons: [],
  },
];

const INITIAL_BARISTAS: Barista[] = [
  {
    id: 'bar_1',
    name: 'علي الأحمد (Ali)',
    pin: '1234',
    branch: 'فرع الشعلان - دمشق (Shaalan Branch)',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    totalStampsGiven: 412,
    totalRedemptions: 68,
  },
  {
    id: 'bar_2',
    name: 'ريم الدوسري (Reem)',
    pin: '5678',
    branch: 'فرع المالكي - دمشق (Malki Branch)',
    active: true,
    createdAt: '2026-02-15T00:00:00Z',
    totalStampsGiven: 289,
    totalRedemptions: 43,
  },
];

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew_1',
    titleEn: 'Signature Specialty Cold Brew',
    titleAr: 'كولد برو القهوة المختصة الفاخر',
    descriptionEn: 'Slow steeped for 18 hours using Ethiopian Yirgacheffe beans.',
    descriptionAr: 'منقوع ببطء لمدة 18 ساعة باستخدام حبوب القهوة الإثيوبية الفاخرة.',
    pointsCost: 80,
    category: 'drink',
    icon: 'coffee',
    available: true,
  },
  {
    id: 'rew_2',
    titleEn: 'Artisan Almond Croissant',
    titleAr: 'كرواسون اللوز الفرنسي الطازج',
    descriptionEn: 'Freshly baked flaky butter croissant filled with almond cream.',
    descriptionAr: 'كرواسون فرنسي هش بالزبدة محشو بكريمة اللوز ومحمص يومياً.',
    pointsCost: 100,
    category: 'pastry',
    icon: 'croissant',
    available: true,
  },
  {
    id: 'rew_3',
    titleEn: '250g Colombia Geisha Roasted Beans',
    titleAr: 'محصول بن كولومبيا غيشا 250 جرام',
    descriptionEn: 'Award-winning light roast with jasmine, peach, and honey floral notes.',
    descriptionAr: 'محصول فاخر بتحميص خفيف مع إيحاءات الياسمين والخوخ والعسل.',
    pointsCost: 350,
    category: 'beans',
    icon: 'package',
    available: true,
  },
  {
    id: 'rew_4',
    titleEn: 'Custom Thermal Coffee Tumbler 500ml',
    titleAr: 'كوب حراري مخصص بحفر اسمك 500 مل',
    descriptionEn: 'Double-walled matte black stainless steel insulated travel mug.',
    descriptionAr: 'كوب ستانلس ستيل عازل للحرارة مطفي مع نقش شعارك أو اسمك.',
    pointsCost: 500,
    category: 'merch',
    icon: 'gift',
    available: true,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    customerId: 'cust_1',
    customerName: 'سارة القحطاني',
    cardNumber: 'COFFEE-1001',
    type: 'stamp_add',
    stampsChanged: 2,
    pointsChanged: 25,
    detailsEn: 'Ordered 2x Flat White & Spanish Latte',
    detailsAr: 'طلب 2 فلات وايت وسبانش لاتيه',
    performedBy: 'Barista: Ali (علي)',
    createdAt: '2026-09-02T16:30:00Z',
  },
  {
    id: 'tx_2',
    customerId: 'cust_2',
    customerName: 'خالد المنصور',
    cardNumber: 'COFFEE-2045',
    type: 'stamp_add',
    stampsChanged: 1,
    pointsChanged: 12,
    detailsEn: 'Ordered 1x V60 Drip Coffee',
    detailsAr: 'طلب 1 قهوة مقطرة V60',
    performedBy: 'Barista: Noor (نورة)',
    createdAt: '2026-08-28T09:15:00Z',
  },
];

const INITIAL_FEEDBACK: SurveyFeedback[] = [
  {
    id: 'fb_1',
    customerId: 'cust_1',
    customerName: 'سارة القحطاني',
    ratingQuality: 5,
    ratingService: 5,
    ratingAmbiance: 4,
    ratingSpeed: 5,
    overallRating: 4.8,
    comment: 'The Ethiopian roast is outstanding and the latte art was gorgeous! Friendly barista staff.',
    createdAt: '2026-09-01T14:10:00Z',
  },
];

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  t: (key: keyof typeof translations.en, params?: Record<string, string | number>) => string;
  
  // Customer State
  currentCustomer: Customer | null;
  setCurrentCustomer: (c: Customer | null) => void;
  loginCustomerByCard: (cardNumberOrPhone: string) => { success: boolean; message: string; customer?: Customer };
  registerCustomer: (name: string, phone: string, dob?: string, refCode?: string) => { success: boolean; customer: Customer };
  logoutCustomer: () => void;
  
  // Barista State
  activeBarista: Barista | null;
  setActiveBarista: (b: Barista | null) => void;
  baristaLogin: (pin: string) => boolean;
  logoutBarista: () => void;
  
  // Owner / Admin State
  isOwnerAuthenticated: boolean;
  ownerLogin: (pin: string) => boolean;
  logoutOwner: () => void;
  
  // App collections
  settings: StoreSettings;
  updateSettings: (s: Partial<StoreSettings>) => void;
  customers: Customer[];
  baristas: Barista[];
  rewards: RewardItem[];
  transactions: Transaction[];
  feedbackList: SurveyFeedback[];
  whatsAppLogs: WhatsAppLog[];
  notifications: BroadcastNotification[];
  
  // Core loyalty operations
  approveCustomer: (customerId: string) => Promise<void>;
  rejectCustomer: (customerId: string) => void;
  addStamps: (customerId: string, stampsToAdd: number, baristaName?: string) => Promise<void>;
  redeemFreeDrink: (customerId: string, baristaName?: string) => Promise<void>;
  redeemCatalogReward: (customerId: string, rewardId: string, baristaName?: string) => Promise<{ success: boolean; message: string }>;
  redeemCoupon: (customerId: string, couponId: string, baristaName?: string) => Promise<{ success: boolean; message: string }>;
  spinWheel: (customerId: string) => {
    success: boolean;
    prize: string;
    isWinning: boolean;
    sectorIndex: number;
    coupon?: Coupon;
    points?: number;
    stamps?: number;
    remainingSpinsToday: number;
    error?: string;
  };
  submitFeedback: (customerId: string, ratings: { quality: number; service: number; ambiance: number; speed: number }, comment: string) => void;
  
  // Management actions
  tierConfigs: Record<TierLevel, TierConfig>;
  updateTierConfig: (tierId: TierLevel, config: Partial<TierConfig>) => void;
  updateAllTierConfigs: (newConfigs: Record<TierLevel, TierConfig>, syncCustomers?: boolean) => void;
  syncCustomersTiers: () => void;
  updateCustomer: (customer: Customer) => void;
  toggleCustomerStatus: (customerId: string, newStatus?: 'approved' | 'pending' | 'suspended') => void;
  deleteCustomer: (customerId: string) => void;
  addRewardItem: (item: Omit<RewardItem, 'id'>) => void;
  updateRewardItem: (item: RewardItem) => void;
  deleteRewardItem: (id: string) => void;
  addBarista: (b: Omit<Barista, 'id' | 'createdAt' | 'totalStampsGiven' | 'totalRedemptions'>) => void;
  updateBarista: (b: Barista) => void;
  deleteBarista: (id: string) => void;
  sendBroadcast: (titleEn: string, titleAr: string, messageEn: string, messageAr: string, targetTier: 'all' | TierLevel, viaPush: boolean, viaWhatsapp: boolean) => Promise<number>;
  sendTestWhatsApp: (phone: string, overrideConfig?: { apiUrl?: string; apiKey?: string; whatsappDeviceId?: string; enabled?: boolean }) => Promise<ZenderSendResult>;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with graceful fallback
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('coffee_role') as UserRole) || 'customer';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('coffee_lang') as Language) || 'ar'; // Middle-Eastern default Arabic
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('coffee_dark');
    return saved !== null ? saved === 'true' : false;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('coffee_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currency === 'SAR') {
        parsed.currency = 'SYP';
      }
      // Ensure welcome template has login_link variable
      if (parsed.zender && parsed.zender.welcomeTemplate && !parsed.zender.welcomeTemplate.includes('{login_link}') && !parsed.zender.welcomeTemplate.includes('{login_url}')) {
        parsed.zender.welcomeTemplate = parsed.zender.welcomeTemplate.trim() + '\n\n🔗 رابط بطاقتك ودخول حسابك المباشر:\n{login_link}';
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        tiers: parsed.tiers || DEFAULT_TIER_CONFIGS,
        wheel: {
          ...DEFAULT_SETTINGS.wheel,
          ...(parsed.wheel || {}),
          sectors:
            parsed.wheel?.sectors && Array.isArray(parsed.wheel.sectors) && parsed.wheel.sectors.length > 0
              ? parsed.wheel.sectors
              : DEFAULT_SETTINGS.wheel.sectors,
        },
      };
    }
    return DEFAULT_SETTINGS;
  });

  const [tierConfigs, setTierConfigs] = useState<Record<TierLevel, TierConfig>>(() => {
    const saved = localStorage.getItem('coffee_tiers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SETTINGS.tiers || DEFAULT_TIER_CONFIGS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('coffee_customers');
    if (saved) {
      const parsed: Customer[] = JSON.parse(saved);
      return parsed.map((c) => {
        if (c.phone.startsWith('+966')) {
          return { ...c, phone: c.phone.replace('+9665', '+9639') };
        }
        return c;
      });
    }
    return INITIAL_CUSTOMERS;
  });

  const [baristas, setBaristas] = useState<Barista[]>(() => {
    const saved = localStorage.getItem('coffee_baristas');
    return saved ? JSON.parse(saved) : INITIAL_BARISTAS;
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const saved = localStorage.getItem('coffee_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('coffee_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [feedbackList, setFeedbackList] = useState<SurveyFeedback[]>(() => {
    const saved = localStorage.getItem('coffee_feedback');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>(() => {
    const saved = localStorage.getItem('coffee_wa_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<BroadcastNotification[]>([]);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>('cust_1');
  const [activeBarista, setActiveBarista] = useState<Barista | null>(INITIAL_BARISTAS[0]);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = sessionStorage.getItem('coffee_owner_auth');
    return saved !== null ? saved === 'true' : true;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Sync current customer object
  const currentCustomer = customers.find((c) => c.id === currentCustomerId) || null;

  // Language & RTL side effect
  useEffect(() => {
    localStorage.setItem('coffee_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Dark mode side effect
  useEffect(() => {
    localStorage.setItem('coffee_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem('coffee_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('coffee_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('coffee_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('coffee_baristas', JSON.stringify(baristas));
  }, [baristas]);

  useEffect(() => {
    localStorage.setItem('coffee_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('coffee_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('coffee_wa_logs', JSON.stringify(whatsAppLogs));
  }, [whatsAppLogs]);

  useEffect(() => {
    localStorage.setItem('coffee_feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem('coffee_tiers', JSON.stringify(tierConfigs));
  }, [tierConfigs]);

  // Handle URL query parameters for direct login links (e.g. from WhatsApp welcome message)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get('card') || params.get('login') || params.get('c');
      const phoneParam = params.get('phone');

      if (cardParam || phoneParam) {
        const query = (cardParam || phoneParam)!.trim().toUpperCase();
        const found = customers.find(
          (c) =>
            c.cardNumber.toUpperCase() === query ||
            c.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
        );
        if (found) {
          if (found.status !== 'suspended') {
            setCurrentCustomerId(found.id);
            setRole('customer');
            triggerToast(
              language === 'ar'
                ? `مرحباً بك يا ${found.name}! تم فتح بطاقتك الرقمية بنجاح.`
                : `Welcome back ${found.name}! Your loyalty pass is ready.`,
              'success'
            );
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse URL query params', e);
    }
  }, [customers, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Translation helper with dynamic replacement {variable}
  const t = (key: keyof typeof translations.en, params: Record<string, string | number> = {}): string => {
    const dict = translations[language] || translations.en;
    let text = (dict as any)[key] || (translations.en as any)[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    return text;
  };

  // Dynamic calculateTier based on configured tier point thresholds
  const calculateTier = (points: number, customTiers?: Record<TierLevel, TierConfig>): TierLevel => {
    const active = customTiers || tierConfigs || settings.tiers || DEFAULT_TIER_CONFIGS;
    const levels: TierLevel[] = ['platinum', 'gold', 'silver', 'bronze'];
    // Sort levels descending by minPoints
    levels.sort((a, b) => {
      const minA = active[a]?.minPoints ?? DEFAULT_TIER_CONFIGS[a].minPoints;
      const minB = active[b]?.minPoints ?? DEFAULT_TIER_CONFIGS[b].minPoints;
      return minB - minA;
    });

    for (const lvl of levels) {
      const min = active[lvl]?.minPoints ?? DEFAULT_TIER_CONFIGS[lvl].minPoints;
      if (points >= min) {
        return lvl;
      }
    }
    return 'bronze';
  };

  // Customer Auth
  const loginCustomerByCard = (query: string) => {
    const clean = query.trim().toUpperCase().replace(/\s+/g, '');
    const found = customers.find(
      (c) => c.cardNumber.toUpperCase() === clean || c.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    );
    if (found) {
      if (found.status === 'suspended') {
        return {
          success: false,
          message:
            language === 'ar'
              ? 'تم إيقاف وتعطيل هذا الحساب مؤقتاً من قبل إدارة المتجر. يرجى مراجعة الكاشير أو الإدارة.'
              : 'This account has been disabled/suspended by store management. Please contact staff.',
        };
      }
      setCurrentCustomerId(found.id);
      triggerToast(language === 'ar' ? `مرحباً بك مجدداً ${found.name}` : `Welcome back ${found.name}!`);
      return { success: true, message: 'Logged in successfully', customer: found };
    }
    return {
      success: false,
      message: language === 'ar' ? 'رقم البطاقة أو الجوال غير مسجل. يرجى التحقق أو إنشاء بطاقة جديدة.' : 'Card or phone number not found. Please register.',
    };
  };

  const registerCustomer = (name: string, phone: string, dob?: string, refCode?: string) => {
    const cardNum = `COFFEE-${Math.floor(1000 + Math.random() * 9000)}`;
    const userRefCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 90);

    const newCustomer: Customer = {
      id: 'cust_' + Date.now(),
      cardNumber: cardNum,
      name,
      phone,
      dateOfBirth: dob,
      status: 'pending', // Pending approval by barista/owner
      currentStamps: 0,
      totalStampsCollected: 0,
      totalPoints: 10, // welcome bonus points
      tier: 'bronze',
      referralCode: userRefCode,
      referredBy: refCode ? refCode.trim().toUpperCase() : undefined,
      referralCount: 0,
      joinedAt: new Date().toISOString(),
      coupons: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentCustomerId(newCustomer.id);
    triggerToast(
      language === 'ar'
        ? `تم إنشاء بطاقتك بنجاح (${cardNum})! بانتظار اعتماد الباريستا.`
        : `Digital card created (${cardNum})! Pending Barista approval.`
    );
    return { success: true, customer: newCustomer };
  };

  const logoutCustomer = () => {
    setCurrentCustomerId(null);
  };

  // Barista Auth
  const baristaLogin = (pin: string) => {
    const found = baristas.find((b) => b.pin === pin && b.active);
    if (found) {
      setActiveBarista(found);
      triggerToast(language === 'ar' ? `تم تسجيل دخول الباريستا: ${found.name}` : `Barista logged in: ${found.name}`);
      return true;
    }
    triggerToast(language === 'ar' ? 'رمز PIN غير صحيح' : 'Invalid Barista PIN', 'warning');
    return false;
  };

  const logoutBarista = () => {
    setActiveBarista(null);
    triggerToast(language === 'ar' ? 'تم تسجيل خروج الباريستا بنجاح' : 'Barista logged out');
  };

  // Owner / Admin Auth
  const ownerLogin = (pin: string): boolean => {
    const validPin = settings.ownerPin || '1234';
    if (pin.trim() === validPin.trim()) {
      setIsOwnerAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('coffee_owner_auth', 'true');
      }
      triggerToast(language === 'ar' ? 'تم تسجيل دخول المالك والأدمن بنجاح' : 'Admin authenticated successfully');
      return true;
    }
    triggerToast(language === 'ar' ? 'رمز PIN للأدمن غير صحيح' : 'Invalid Owner PIN', 'warning');
    return false;
  };

  const logoutOwner = () => {
    setIsOwnerAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('coffee_owner_auth', 'false');
    }
    triggerToast(language === 'ar' ? 'تم تسجيل خروج الأدمن بنجاح' : 'Owner / Admin logged out');
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    triggerToast(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings updated successfully!');
  };

  // Approve Customer -> Dispatches automated WhatsApp welcome message
  const approveCustomer = async (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    const updated = { ...target, status: 'approved' as const };
    
    // Check if customer was referred and reward referrer
    let referrerUpdate: Customer | undefined;
    if (target.referredBy) {
      const referrer = customers.find((c) => c.referralCode.toUpperCase() === target.referredBy?.toUpperCase());
      if (referrer) {
        referrerUpdate = {
          ...referrer,
          currentStamps: Math.min(settings.stampsForFreeDrink, referrer.currentStamps + settings.referralRewardStamps),
          totalStampsCollected: referrer.totalStampsCollected + settings.referralRewardStamps,
          referralCount: (referrer.referralCount || 0) + 1,
          totalPoints: referrer.totalPoints + 30,
        };
      }
    }

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) return updated;
        if (referrerUpdate && c.id === referrerUpdate.id) return referrerUpdate;
        return c;
      })
    );

    // Send WhatsApp Welcome Message via Zender Service
    const log = await ZenderService.sendWhatsApp(updated, settings, 'welcome');
    setWhatsAppLogs((prev) => [log, ...prev]);

    triggerToast(
      language === 'ar'
        ? `تم اعتماد العميل ${updated.name} وإرسال رسالة الترحيب عبر واتساب!`
        : `Customer ${updated.name} approved & WhatsApp welcome sent!`
    );
  };

  const rejectCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    triggerToast(language === 'ar' ? 'تم رفض وحذف الطلب' : 'Customer registration rejected', 'info');
  };

  // Update customer details from CRM
  const updateCustomer = (updatedCustomer: Customer) => {
    const target = customers.find((c) => c.id === updatedCustomer.id);
    let finalTier = updatedCustomer.tier;
    if (target && target.totalPoints !== updatedCustomer.totalPoints) {
      finalTier = calculateTier(updatedCustomer.totalPoints);
    }
    const customerToSave: Customer = {
      ...updatedCustomer,
      tier: finalTier,
    };

    setCustomers((prev) => prev.map((c) => (c.id === customerToSave.id ? customerToSave : c)));
    triggerToast(language === 'ar' ? 'تم تحديث بيانات العميل بنجاح!' : 'Customer account updated successfully!');
  };

  // Toggle Customer Status (Enable / Disable / Approve / Suspend)
  const toggleCustomerStatus = (customerId: string, newStatus?: 'approved' | 'pending' | 'suspended') => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    let nextStatus: 'approved' | 'pending' | 'suspended';
    if (newStatus) {
      nextStatus = newStatus;
    } else {
      nextStatus = target.status === 'suspended' ? 'approved' : 'suspended';
    }

    const updated: Customer = {
      ...target,
      status: nextStatus,
    };

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));

    if (nextStatus === 'suspended') {
      triggerToast(
        language === 'ar'
          ? `تم تعطيل وإيقاف حساب العميل: ${target.name}`
          : `Customer account disabled: ${target.name}`,
        'warning'
      );
    } else if (nextStatus === 'approved') {
      triggerToast(
        language === 'ar'
          ? `تم تفعيل وتشغيل حساب العميل: ${target.name}`
          : `Customer account enabled: ${target.name}`,
        'success'
      );
    }
  };

  const deleteCustomer = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    triggerToast(
      language === 'ar'
        ? `تم حذف حساب العميل ${target ? target.name : ''}`
        : 'Customer account deleted',
      'info'
    );
  };

  // Tier Configuration Methods
  const updateTierConfig = (tierId: TierLevel, config: Partial<TierConfig>) => {
    setTierConfigs((prev) => {
      const updated = {
        ...prev,
        [tierId]: {
          ...prev[tierId],
          ...config,
        },
      };
      setSettings((s) => ({ ...s, tiers: updated }));
      return updated;
    });
    triggerToast(language === 'ar' ? 'تم حفظ إعدادات الفئة' : 'Tier configuration updated!');
  };

  const updateAllTierConfigs = (newConfigs: Record<TierLevel, TierConfig>, syncCustomers: boolean = true) => {
    setTierConfigs(newConfigs);
    setSettings((prev) => ({ ...prev, tiers: newConfigs }));

    if (syncCustomers) {
      setCustomers((prev) =>
        prev.map((c) => ({
          ...c,
          tier: calculateTier(c.totalPoints, newConfigs),
        }))
      );
    }

    triggerToast(
      language === 'ar'
        ? 'تم حفظ إعدادات المستويات والنقاط وتحديث فئات العملاء بنجاح!'
        : 'Tier configurations and member tiers synchronized successfully!'
    );
  };

  const syncCustomersTiers = () => {
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        tier: calculateTier(c.totalPoints, tierConfigs),
      }))
    );
    triggerToast(
      language === 'ar'
        ? 'تمت إعادة احتساب وتحديث فئات جميع العملاء بنجاح حسب إعدادات النقاط الحالية!'
        : 'All customer tiers synchronized successfully!'
    );
  };

  // Add stamps to customer
  const addStamps = async (customerId: string, count: number, baristaName: string = 'Barista') => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    if (target.status === 'suspended') {
      triggerToast(
        language === 'ar'
          ? 'تعذر إضافة الأختام: حساب هذا العميل معطل وموقوف من قبل الإدارة'
          : 'Cannot add stamps: Customer account is disabled/suspended',
        'warning'
      );
      return;
    }

    const maxStamps = settings.stampsForFreeDrink || 8;
    const newStampsTotal = target.currentStamps + count;
    const freeDrinksEarned = Math.floor(newStampsTotal / maxStamps);
    const remainderStamps = newStampsTotal % maxStamps;

    const currentMultiplier = (tierConfigs[target.tier]?.multiplier) ?? (TIER_CONFIGS[target.tier]?.multiplier ?? 1);
    const pointsToAdd = Math.round(count * settings.pointsPerStamp * currentMultiplier);
    const newTotalPoints = target.totalPoints + pointsToAdd;
    const newTier = calculateTier(newTotalPoints);

    const updatedCustomer: Customer = {
      ...target,
      currentStamps: remainderStamps,
      totalStampsCollected: target.totalStampsCollected + count,
      totalPoints: newTotalPoints,
      tier: newTier,
      lastVisitAt: new Date().toISOString(),
    };

    // If a free drink was unlocked in this stamp batch, add a free drink coupon
    if (freeDrinksEarned > 0) {
      for (let i = 0; i < freeDrinksEarned; i++) {
        updatedCustomer.coupons.push({
          id: 'cp_free_' + Math.random().toString(36).substring(2, 7),
          code: `FREE-DRINK-${Math.floor(100 + Math.random() * 900)}`,
          titleEn: '100% Free Any Specialty Coffee',
          titleAr: 'مشروب قهوة مختصة مجاني بالكامل (مكافأة 8 أختام)',
          discountType: 'free_item',
          discountValue: 'Free Specialty Drink',
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          used: false,
          source: 'promo',
        });
      }
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updatedCustomer : c)));

    // Record Transaction
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      cardNumber: target.cardNumber,
      type: 'stamp_add',
      stampsChanged: count,
      pointsChanged: pointsToAdd,
      detailsEn: `Added ${count} coffee stamps (+${pointsToAdd} pts)`,
      detailsAr: `إضافة ${count} أختام قهوة (+${pointsToAdd} نقطة)`,
      performedBy: baristaName,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update active barista count
    if (activeBarista) {
      setBaristas((prev) =>
        prev.map((b) => (b.id === activeBarista.id ? { ...b, totalStampsGiven: b.totalStampsGiven + count } : b))
      );
    }

    // Send WhatsApp notification
    const log = await ZenderService.sendWhatsApp(updatedCustomer, settings, 'stamp', undefined, { stampsAdded: count });
    setWhatsAppLogs((prev) => [log, ...prev]);

    triggerToast(
      language === 'ar'
        ? `تم ختم ${count} أكواب للعميل ${target.name}! (+${pointsToAdd} نقطة)`
        : `Added ${count} stamps for ${target.name}! (+${pointsToAdd} pts)`
    );
  };

  // Redeem Free Drink using accumulated stamps
  const redeemFreeDrink = async (customerId: string, baristaName: string = 'Barista') => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    if (target.currentStamps < settings.stampsForFreeDrink && target.coupons.filter(cp => !cp.used && cp.discountType === 'free_item').length === 0) {
      triggerToast(language === 'ar' ? 'الأختام غير كافية لاستبدال المشروب المجاني' : 'Not enough stamps for free drink', 'warning');
      return;
    }

    // Check if using stamp card or coupon
    let updatedCoupons = [...target.currentCoupons || target.coupons];
    let stampsDeducted = 0;

    const freeCouponIdx = updatedCoupons.findIndex((cp) => !cp.used && cp.discountType === 'free_item');
    if (freeCouponIdx >= 0) {
      updatedCoupons[freeCouponIdx] = {
        ...updatedCoupons[freeCouponIdx],
        used: true,
        usedAt: new Date().toISOString(),
      };
    } else {
      stampsDeducted = settings.stampsForFreeDrink;
    }

    const updated: Customer = {
      ...target,
      currentStamps: Math.max(0, target.currentStamps - stampsDeducted),
      coupons: updatedCoupons,
    };

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));

    // Record Transaction
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      cardNumber: target.cardNumber,
      type: 'stamp_redeem',
      stampsChanged: -stampsDeducted,
      pointsChanged: 0,
      detailsEn: 'Redeemed Free Specialty Drink reward',
      detailsAr: 'استبدال مشروب قهوة مختصة مجاناً',
      performedBy: baristaName,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (activeBarista) {
      setBaristas((prev) =>
        prev.map((b) => (b.id === activeBarista.id ? { ...b, totalRedemptions: b.totalRedemptions + 1 } : b))
      );
    }

    // Send WhatsApp redemption receipt
    const log = await ZenderService.sendWhatsApp(updated, settings, 'redemption', undefined, { rewardName: 'Free Specialty Coffee' });
    setWhatsAppLogs((prev) => [log, ...prev]);

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    triggerToast(
      language === 'ar'
        ? `تم استبدال المشروب المجاني للعميل ${target.name} بنجاح! بالعافية ☕`
        : `Free drink redeemed for ${target.name}! Enjoy ☕`
    );
  };

  // Redeem catalog reward
  const redeemCatalogReward = async (customerId: string, rewardId: string, baristaName: string = 'Barista') => {
    const target = customers.find((c) => c.id === customerId);
    const reward = rewards.find((r) => r.id === rewardId);
    if (!target || !reward) return { success: false, message: 'Invalid customer or reward' };

    if (target.totalPoints < reward.pointsCost) {
      return {
        success: false,
        message: language === 'ar' ? 'رصيد النقاط غير كافٍ لهذه المكافأة' : 'Insufficient points for this reward',
      };
    }

    const updated: Customer = {
      ...target,
      totalPoints: target.totalPoints - reward.pointsCost,
    };

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      cardNumber: target.cardNumber,
      type: 'points_redeem',
      stampsChanged: 0,
      pointsChanged: -reward.pointsCost,
      detailsEn: `Redeemed ${reward.titleEn} (-${reward.pointsCost} pts)`,
      detailsAr: `استبدال ${reward.titleAr} (-${reward.pointsCost} نقطة)`,
      performedBy: baristaName,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    const log = await ZenderService.sendWhatsApp(updated, settings, 'redemption', undefined, {
      rewardName: language === 'ar' ? reward.titleAr : reward.titleEn,
    });
    setWhatsAppLogs((prev) => [log, ...prev]);

    confetti({ particleCount: 90, spread: 60 });
    return {
      success: true,
      message: language === 'ar' ? `تم استبدال ${reward.titleAr} بنجاح!` : `Redeemed ${reward.titleEn} successfully!`,
    };
  };

  // Redeem Coupon
  const redeemCoupon = async (customerId: string, couponId: string, baristaName: string = 'Barista') => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return { success: false, message: 'Customer not found' };

    const couponIdx = target.coupons.findIndex((cp) => cp.id === couponId);
    if (couponIdx < 0) return { success: false, message: 'Coupon not found' };
    if (target.coupons[couponIdx].used) return { success: false, message: 'Coupon already redeemed' };

    const updatedCoupons = [...target.coupons];
    updatedCoupons[couponIdx] = {
      ...updatedCoupons[couponIdx],
      used: true,
      usedAt: new Date().toISOString(),
    };

    const updated: Customer = { ...target, coupons: updatedCoupons };
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      cardNumber: target.cardNumber,
      type: 'points_redeem',
      stampsChanged: 0,
      pointsChanged: 0,
      detailsEn: `Used coupon: ${updatedCoupons[couponIdx].titleEn}`,
      detailsAr: `استخدام كوبون: ${updatedCoupons[couponIdx].titleAr}`,
      performedBy: baristaName,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: language === 'ar' ? 'تم استبدال الكوبون بنجاح!' : 'Coupon redeemed successfully!',
    };
  };

  // Dynamic Fortune Wheel (Supports Enable/Disable, Custom Spins Limit, and Win/Lose Options)
  const spinWheel = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) {
      return {
        success: false,
        prize: 'Error',
        isWinning: false,
        sectorIndex: 0,
        remainingSpinsToday: 0,
        error: 'Customer not found',
      };
    }

    const wheelConfig = settings.wheel || DEFAULT_SETTINGS.wheel;
    if (!wheelConfig.enabled) {
      return {
        success: false,
        prize: language === 'ar' ? 'عجلة الحظ غير مفعّلة حالياً من قبل المتجر' : 'Fortune Wheel is currently disabled',
        isWinning: false,
        sectorIndex: 0,
        remainingSpinsToday: 0,
        error: 'Wheel is disabled',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const spinsUsedToday = target.lastSpinDate === todayStr ? (target.spinsCountToday || 0) : 0;
    const maxSpins = wheelConfig.spinsPerDay || 1;

    if (spinsUsedToday >= maxSpins) {
      return {
        success: false,
        prize: language === 'ar' ? 'لقد استنفدت عدد مرات التدوير لليوم' : 'You have reached your daily spin limit',
        isWinning: false,
        sectorIndex: 0,
        remainingSpinsToday: 0,
        error: 'Daily spin limit reached',
      };
    }

    const sectors =
      wheelConfig.sectors && Array.isArray(wheelConfig.sectors) && wheelConfig.sectors.length > 0
        ? wheelConfig.sectors
        : DEFAULT_WHEEL_SECTORS;

    const chosenIndex = Math.floor(Math.random() * sectors.length);
    const chosen = sectors[chosenIndex];

    let newCoupons = [...target.coupons];
    let newPoints = target.totalPoints;
    let newStamps = target.currentStamps;
    let createdCoupon: Coupon | undefined;

    if (chosen.isWinning) {
      if (chosen.type === 'points') {
        newPoints += Number(chosen.value || 0);
      } else if (chosen.type === 'stamp') {
        newStamps = Math.min(settings.stampsForFreeDrink, newStamps + Number(chosen.value || 1));
      } else if (chosen.type === 'coupon') {
        createdCoupon = {
          id: 'cp_wheel_' + Math.random().toString(36).substring(2, 7),
          code: `WHEEL-${Math.floor(1000 + Math.random() * 9000)}`,
          titleEn: chosen.labelEn,
          titleAr: chosen.labelAr,
          discountType: chosen.discountType || 'percentage',
          discountValue: chosen.value || 10,
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          used: false,
          source: 'wheel',
        };
        newCoupons.push(createdCoupon);
      }

      // Record Winning Transaction
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        customerId: target.id,
        customerName: target.name,
        cardNumber: target.cardNumber,
        type: 'wheel_reward',
        stampsChanged: chosen.type === 'stamp' ? Number(chosen.value || 1) : 0,
        pointsChanged: chosen.type === 'points' ? Number(chosen.value || 0) : 0,
        detailsEn: `Fortune Wheel Win: ${chosen.labelEn}`,
        detailsAr: `جائزة عجلة الحظ: ${chosen.labelAr}`,
        performedBy: 'Fortune Wheel',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      try {
        confetti({ particleCount: 110, spread: 85, origin: { y: 0.55 } });
      } catch {}
    } else {
      // Non-winning / Lose option
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        customerId: target.id,
        customerName: target.name,
        cardNumber: target.cardNumber,
        type: 'wheel_reward',
        stampsChanged: 0,
        pointsChanged: 0,
        detailsEn: `Fortune Wheel Spin: ${chosen.labelEn} (Better Luck Next Time)`,
        detailsAr: `تدوير عجلة الحظ: ${chosen.labelAr} (حظ أوفر)`,
        performedBy: 'Fortune Wheel',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    const newSpinsUsedToday = spinsUsedToday + 1;
    const remainingSpins = Math.max(0, maxSpins - newSpinsUsedToday);

    const updatedCustomer: Customer = {
      ...target,
      lastSpinDate: todayStr,
      spinsCountToday: newSpinsUsedToday,
      totalPoints: newPoints,
      currentStamps: newStamps,
      coupons: newCoupons,
    };

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updatedCustomer : c)));

    return {
      success: true,
      prize: language === 'ar' ? chosen.labelAr : chosen.labelEn,
      isWinning: chosen.isWinning,
      sectorIndex: chosenIndex,
      coupon: createdCoupon,
      points: chosen.type === 'points' ? Number(chosen.value) : undefined,
      stamps: chosen.type === 'stamp' ? Number(chosen.value || 1) : undefined,
      remainingSpinsToday: remainingSpins,
    };
  };

  // In-app survey feedback
  const submitFeedback = (
    customerId: string,
    ratings: { quality: number; service: number; ambiance: number; speed: number },
    comment: string
  ) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    const overall = (ratings.quality + ratings.service + ratings.ambiance + ratings.speed) / 4;
    const newFeedback: SurveyFeedback = {
      id: 'fb_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      ratingQuality: ratings.quality,
      ratingService: ratings.service,
      ratingAmbiance: ratings.ambiance,
      ratingSpeed: ratings.speed,
      overallRating: Math.round(overall * 10) / 10,
      comment,
      createdAt: new Date().toISOString(),
    };

    setFeedbackList((prev) => [newFeedback, ...prev]);

    // Give bonus points for survey
    const bonusPoints = settings.surveyRewardPoints || 25;
    const updatedCustomer: Customer = {
      ...target,
      totalPoints: target.totalPoints + bonusPoints,
      tier: calculateTier(target.totalPoints + bonusPoints),
    };
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updatedCustomer : c)));

    // Record Transaction
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      customerId: target.id,
      customerName: target.name,
      cardNumber: target.cardNumber,
      type: 'survey_bonus',
      stampsChanged: 0,
      pointsChanged: bonusPoints,
      detailsEn: `Customer feedback bonus (+${bonusPoints} pts)`,
      detailsAr: `مكافأة تعبئة استبيان تقييم الخدمة (+${bonusPoints} نقطة)`,
      performedBy: 'Feedback System',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    triggerToast(
      language === 'ar'
        ? `شكراً لتقييمك! تمت إضافة +${bonusPoints} نقطة هدية لرصيدك.`
        : `Thank you for your feedback! +${bonusPoints} bonus points awarded.`
    );
  };

  // Store owner item catalog operations
  const addRewardItem = (item: Omit<RewardItem, 'id'>) => {
    const newRew: RewardItem = { ...item, id: 'rew_' + Date.now() };
    setRewards((prev) => [newRew, ...prev]);
    triggerToast(language === 'ar' ? 'تمت إضافة المكافأة بنجاح' : 'Reward added successfully!');
  };

  const updateRewardItem = (item: RewardItem) => {
    setRewards((prev) => prev.map((r) => (r.id === item.id ? item : r)));
    triggerToast(language === 'ar' ? 'تم تحديث المكافأة' : 'Reward updated!');
  };

  const deleteRewardItem = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    triggerToast(language === 'ar' ? 'تم حذف المكافأة' : 'Reward removed!');
  };

  // Barista CRUD
  const addBarista = (b: Omit<Barista, 'id' | 'createdAt' | 'totalStampsGiven' | 'totalRedemptions'>) => {
    const newBar: Barista = {
      ...b,
      id: 'bar_' + Date.now(),
      createdAt: new Date().toISOString(),
      totalStampsGiven: 0,
      totalRedemptions: 0,
    };
    setBaristas((prev) => [...prev, newBar]);
    triggerToast(language === 'ar' ? 'تم إنشاء حساب الباريستا بنجاح' : 'Barista account created!');
  };

  const updateBarista = (b: Barista) => {
    setBaristas((prev) => prev.map((bar) => (bar.id === b.id ? b : bar)));
    if (activeBarista && activeBarista.id === b.id) {
      setActiveBarista(b);
    }
    triggerToast(language === 'ar' ? 'تم تعديل بيانات ورمز الباريستا بنجاح' : 'Barista details & PIN updated!');
  };

  const deleteBarista = (id: string) => {
    setBaristas((prev) => prev.filter((bar) => bar.id !== id));
    triggerToast(language === 'ar' ? 'تم حذف حساب الباريستا' : 'Barista deleted!');
  };

  // Broadcaster
  const sendBroadcast = async (
    titleEn: string,
    titleAr: string,
    messageEn: string,
    messageAr: string,
    targetTier: 'all' | TierLevel,
    viaPush: boolean,
    viaWhatsapp: boolean
  ): Promise<number> => {
    const targetCustomers = customers.filter(
      (c) => c.status === 'approved' && (targetTier === 'all' || c.tier === targetTier)
    );

    const newNotif: BroadcastNotification = {
      id: 'notif_' + Date.now(),
      titleEn,
      titleAr,
      messageEn,
      messageAr,
      targetTier,
      sendViaPush: viaPush,
      sendViaWhatsapp: viaWhatsapp,
      createdAt: new Date().toISOString(),
      sentCount: targetCustomers.length,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (viaWhatsapp) {
      for (const cust of targetCustomers) {
        const text = language === 'ar' ? messageAr : messageEn;
        const log = await ZenderService.sendWhatsApp(cust, settings, 'promo', text);
        setWhatsAppLogs((prev) => [log, ...prev]);
      }
    }

    triggerToast(
      language === 'ar'
        ? `تم إرسال الحملة الترويجية إلى ${targetCustomers.length} عميل!`
        : `Campaign sent to ${targetCustomers.length} customers!`
    );

    return targetCustomers.length;
  };

  // Test WhatsApp via Zender
  const sendTestWhatsApp = async (
    phone: string,
    overrideConfig?: { apiUrl?: string; apiKey?: string; whatsappDeviceId?: string; enabled?: boolean }
  ): Promise<ZenderSendResult> => {
    const dummyCustomer: Customer = {
      id: 'test',
      cardNumber: 'COFFEE-TEST',
      name: 'Coffee Test User (مستخدم تجريبي)',
      phone: phone || '+963944112233',
      status: 'approved',
      currentStamps: 4,
      totalStampsCollected: 10,
      totalPoints: 100,
      tier: 'gold',
      referralCode: 'TEST',
      joinedAt: new Date().toISOString(),
      coupons: [],
      referralCount: 0,
    };

    const result = await ZenderService.dispatch(
      dummyCustomer,
      settings,
      'test',
      undefined,
      {},
      overrideConfig
    );

    setWhatsAppLogs((prev) => [result.log, ...prev]);

    if (result.success) {
      triggerToast(
        language === 'ar'
          ? 'تم إرسال رسالة الاختبار بنجاح عبر 963 CRM!'
          : 'Test message delivered successfully via 963 CRM!',
        'success'
      );
    } else {
      triggerToast(
        language === 'ar'
          ? `فشل الإرسال: ${result.error || 'تحقق من بيانات 963 CRM'}`
          : `Delivery failed: ${result.error || 'Check 963 CRM settings'}`,
        'warning'
      );
    }

    return result;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        darkMode,
        toggleDarkMode,
        t,
        currentCustomer,
        setCurrentCustomer: (c) => setCurrentCustomerId(c ? c.id : null),
        loginCustomerByCard,
        registerCustomer,
        logoutCustomer,
        activeBarista,
        setActiveBarista,
        baristaLogin,
        logoutBarista,
        isOwnerAuthenticated,
        ownerLogin,
        logoutOwner,
        settings,
        updateSettings,
        customers,
        baristas,
        rewards,
        transactions,
        feedbackList,
        whatsAppLogs,
        notifications,
        approveCustomer,
        rejectCustomer,
        addStamps,
        redeemFreeDrink,
        redeemCatalogReward,
        redeemCoupon,
        spinWheel,
        submitFeedback,
        tierConfigs,
        updateTierConfig,
        updateAllTierConfigs,
        syncCustomersTiers,
        updateCustomer,
        toggleCustomerStatus,
        deleteCustomer,
        addRewardItem,
        updateRewardItem,
        deleteRewardItem,
        addBarista,
        updateBarista,
        deleteBarista,
        sendBroadcast,
        sendTestWhatsApp,
        triggerToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
