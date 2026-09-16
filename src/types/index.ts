export type UserRole = 'landing' | 'customer' | 'barista' | 'owner';

export type Language = 'en' | 'ar';

export type CustomerStatus = 'pending' | 'approved' | 'suspended';

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierConfig {
  id: TierLevel;
  nameEn: string;
  nameAr: string;
  minPoints: number;
  multiplier: number; // e.g. 1.0x, 1.25x points
  color: string;
  perksEn: string[];
  perksAr: string[];
}

export interface WheelSector {
  id: string;
  labelEn: string;
  labelAr: string;
  type: 'points' | 'stamp' | 'coupon' | 'lose';
  value?: number | string;
  discountType?: 'percentage' | 'fixed' | 'free_item';
  color: string;
  isWinning: boolean;
}

export interface WheelSettings {
  enabled: boolean;
  spinsPerDay: number; // Max spins per customer per day (e.g. 1, 2, 3, etc.)
  sectors: WheelSector[];
}

export interface Customer {
  id: string;
  cardNumber: string; // e.g. "100101"
  name: string;
  phone: string; // e.g. "+963944112233"
  dateOfBirth?: string; // YYYY-MM-DD
  status: CustomerStatus;
  currentStamps: number; // 0 to maxStamps (e.g. 8)
  totalStampsCollected: number;
  totalPoints: number;
  tier: TierLevel;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  joinedAt: string;
  lastVisitAt?: string;
  lastSpinDate?: string; // YYYY-MM-DD to track spins date
  spinsCountToday?: number; // Number of spins used on lastSpinDate
  coupons: Coupon[];
  nfcTagUid?: string; // Physical NFC Tag/Card Hardware UID e.g. "04:8b:2e:9a:1c:60:80"
  notes?: string;
}

export interface Barista {
  id: string;
  name: string;
  pin: string; // 4-digit PIN for quick login
  branch: string;
  active: boolean;
  createdAt: string;
  totalStampsGiven: number;
  totalRedemptions: number;
}

export interface RewardItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  pointsCost: number;
  category: 'drink' | 'pastry' | 'beans' | 'merch' | 'discount';
  icon: string;
  available: boolean;
  image?: string;
}

export interface Coupon {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number | string; // 20 (for 20%) or 'Free Espresso'
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  source: 'wheel' | 'referral' | 'birthday' | 'survey' | 'promo';
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  cardNumber: string;
  type: 'stamp_add' | 'stamp_redeem' | 'points_redeem' | 'points_refund' | 'wheel_reward' | 'referral_bonus' | 'birthday_gift' | 'survey_bonus';
  stampsChanged: number;
  pointsChanged: number;
  detailsEn: string;
  detailsAr: string;
  performedBy: string; // 'Barista: Ali' or 'System'
  createdAt: string;
}

export interface SurveyFeedback {
  id: string;
  customerId: string;
  customerName: string;
  ratingQuality: number; // 1-5
  ratingService: number; // 1-5
  ratingAmbiance: number; // 1-5
  ratingSpeed: number; // 1-5
  overallRating: number;
  comment: string;
  createdAt: string;
}

export interface ZenderConfig {
  apiUrl: string;
  apiKey: string;
  whatsappDeviceId: string;
  enabled: boolean;
  welcomeTemplate: string;
  stampAddedTemplate: string;
  rewardRedeemedTemplate: string;
  birthdayTemplate: string;
  promoTemplate: string;
}

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  customerName: string;
  templateType: 'welcome' | 'stamp' | 'redemption' | 'birthday' | 'promo' | 'test';
  message: string;
  status: 'delivered' | 'sent' | 'failed' | 'simulated';
  timestamp: string;
  responsePayload?: string;
}

export interface ThemeColors {
  primary: string; // Hex e.g. #4f46e5 (indigo) or custom
  accent: string;  // Hex e.g. #06b6d4 (cyan)
  background: string;
  cardBg: string;
  textColor: string;
  preset: 'indigoCyan' | 'emeraldTeal' | 'violetAmber' | 'skyBlue' | 'roseCoral';
}

export interface StoreSettings {
  shopNameEn: string;
  shopNameAr: string;
  sloganEn: string;
  sloganAr: string;
  logoIcon: string; // 'coffee' | 'cup-soda' | 'flame' | 'sparkles'
  logoUrl?: string;
  currency: string; // 'SYP' | 'USD' | 'EUR' | 'SAR' | 'AED' | 'ل.س'
  stampsForFreeDrink: number; // default 8
  pointsPerStamp: number; // default 10
  pointsPerCurrencyUnit: number; // default 1 pt per 1 SAR
  stampIcon: 'cup' | 'bean' | 'star' | 'heart';
  theme: ThemeColors;
  zender: ZenderConfig;
  wheel: WheelSettings;
  tiers?: Record<TierLevel, TierConfig>;
  referralRewardStamps: number; // stamps given to referrer
  surveyRewardPoints: number; // points given for survey
  birthdayRewardFreeDrink: boolean;
  ownerPin?: string; // 4-digit PIN for Admin/Owner portal
}

export interface BroadcastNotification {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  targetTier: 'all' | TierLevel;
  sendViaPush: boolean;
  sendViaWhatsapp: boolean;
  createdAt: string;
  sentCount: number;
}

export interface MenuCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  order: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
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
  tag?: string; // 'bestseller' | 'signature' | 'new' | 'seasonal'
  createdAt?: string;
  updatedAt?: string;
}
