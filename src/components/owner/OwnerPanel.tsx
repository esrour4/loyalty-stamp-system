import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Edit2,
  Edit3,
  Gift,
  HelpCircle,
  KeyRound,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Palette,
  Percent,
  Plus,
  Power,
  Radio,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useApp, TIER_CONFIGS } from '../../context/AppContext';
import { Barista, Customer, RewardItem, TierLevel, UserRole } from '../../types';
import { WheelSettingsTab } from './WheelSettingsTab';
import { TierConfigSection } from './TierConfigSection';
import { CustomerEditModal } from './CustomerEditModal';
import { BaristaEditModal } from './BaristaEditModal';
import { ChangeOwnerPinModal } from './ChangeOwnerPinModal';
import { OwnerLogin } from './OwnerLogin';
import { NfcTagWriterModal } from '../common/NfcTagWriterModal';

export const OwnerPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    customers,
    baristas,
    rewards,
    transactions,
    feedbackList,
    whatsAppLogs,
    addRewardItem,
    updateRewardItem,
    deleteRewardItem,
    addBarista,
    updateBarista,
    deleteBarista,
    approveCustomer,
    rejectCustomer,
    updateCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    tierConfigs,
    sendBroadcast,
    sendTestWhatsApp,
    isOwnerAuthenticated,
    logoutOwner,
    language,
    t,
    triggerToast,
  } = useApp();

  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'branding' | 'rewards' | 'wheel' | 'customers' | 'baristas' | 'zender' | 'feedback' | 'broadcast'
  >('analytics');

  // Mobile navigation menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customer Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);

  // NFC Physical Tag Writer Modal State
  const [nfcCustomer, setNfcCustomer] = useState<Customer | null>(null);
  const [showNfcWriterModal, setShowNfcWriterModal] = useState(false);

  // Barista Edit Modal State
  const [editingBarista, setEditingBarista] = useState<Barista | null>(null);
  const [showBaristaEditModal, setShowBaristaEditModal] = useState(false);

  // Owner PIN Change Modal State
  const [showChangeOwnerPinModal, setShowChangeOwnerPinModal] = useState(false);

  // Branding Form State
  const [shopNameEn, setShopNameEn] = useState(settings.shopNameEn);
  const [shopNameAr, setShopNameAr] = useState(settings.shopNameAr);
  const [sloganEn, setSloganEn] = useState(settings.sloganEn);
  const [sloganAr, setSloganAr] = useState(settings.sloganAr);
  const [currency, setCurrency] = useState(settings.currency);
  const [primaryColor, setPrimaryColor] = useState(settings.theme.primary);
  const [accentColor, setAccentColor] = useState(settings.theme.accent);
  const [stampIcon, setStampIcon] = useState(settings.stampIcon);
  const [ownerPinSetting, setOwnerPinSetting] = useState(settings.ownerPin || '1234');

  // Rewards settings
  const [stampsForFree, setStampsForFree] = useState(settings.stampsForFreeDrink);
  const [pointsPerStamp, setPointsPerStamp] = useState(settings.pointsPerStamp);
  const [referralStamps, setReferralStamps] = useState(settings.referralRewardStamps);
  const [surveyPoints, setSurveyPoints] = useState(settings.surveyRewardPoints);

  // New Reward Modal Form
  const [showAddReward, setShowAddReward] = useState(false);
  const [newRewTitleEn, setNewRewTitleEn] = useState('');
  const [newRewTitleAr, setNewRewTitleAr] = useState('');
  const [newRewDescEn, setNewRewDescEn] = useState('');
  const [newRewDescAr, setNewRewDescAr] = useState('');
  const [newRewCost, setNewRewCost] = useState(100);
  const [newRewCategory, setNewRewCategory] = useState<'drink' | 'pastry' | 'beans' | 'merch' | 'discount'>('drink');

  // New Barista Modal Form
  const [showAddBarista, setShowAddBarista] = useState(false);
  const [baristaName, setBaristaName] = useState('');
  const [baristaPin, setBaristaPin] = useState('');
  const [baristaBranch, setBaristaBranch] = useState('');

  // Zender Form State
  const [zenderUrl, setZenderUrl] = useState(settings.zender.apiUrl);
  const [zenderKey, setZenderKey] = useState(settings.zender.apiKey);
  const [zenderDevice, setZenderDevice] = useState(settings.zender.whatsappDeviceId);
  const [zenderEnabled, setZenderEnabled] = useState(settings.zender.enabled);
  const [welcomeTpl, setWelcomeTpl] = useState(settings.zender.welcomeTemplate);
  const [stampTpl, setStampTpl] = useState(settings.zender.stampAddedTemplate);
  const [redeemTpl, setRedeemTpl] = useState(settings.zender.rewardRedeemedTemplate);
  const [birthdayTpl, setBirthdayTpl] = useState(settings.zender.birthdayTemplate);
  const [testPhone, setTestPhone] = useState('+963944112233');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
    details?: string;
    endpointUsed?: string;
    statusCode?: number;
    log?: any;
  } | null>(null);

  // Broadcast Campaign Form
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMsg, setCampaignMsg] = useState('');
  const [targetTier, setTargetTier] = useState<'all' | TierLevel>('all');
  const [sendPush, setSendPush] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);

  // Customer filter
  const [customerFilter, setCustomerFilter] = useState<'all' | 'approved' | 'suspended' | 'pending'>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Save Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerPinSetting && (ownerPinSetting.length !== 4 || !/^\d{4}$/.test(ownerPinSetting))) {
      triggerToast(isAr ? 'رمز PIN للأدمن يجب أن يكون 4 أرقام' : 'Owner PIN must be 4 digits', 'warning');
      return;
    }
    updateSettings({
      shopNameEn,
      shopNameAr,
      sloganEn,
      sloganAr,
      currency,
      stampIcon,
      ownerPin: ownerPinSetting.trim() || '1234',
      theme: {
        ...settings.theme,
        primary: primaryColor,
        accent: accentColor,
      },
    });
  };

  // Color Preset Handler
  const applyColorPreset = (preset: 'indigoCyan' | 'emeraldTeal' | 'violetAmber' | 'skyBlue' | 'roseCoral' | string) => {
    const presets: Record<string, { primary: string; accent: string }> = {
      indigoCyan: { primary: '#4f46e5', accent: '#06b6d4' },
      emeraldTeal: { primary: '#059669', accent: '#14b8a6' },
      violetAmber: { primary: '#7c3aed', accent: '#f59e0b' },
      skyBlue: { primary: '#0284c7', accent: '#38bdf8' },
      roseCoral: { primary: '#e11d48', accent: '#fb7185' },
      // Legacy aliases
      espresso: { primary: '#4f46e5', accent: '#06b6d4' },
      caramel: { primary: '#7c3aed', accent: '#f59e0b' },
      emerald: { primary: '#059669', accent: '#14b8a6' },
      midnight: { primary: '#0284c7', accent: '#38bdf8' },
      rose: { primary: '#e11d48', accent: '#fb7185' },
    };
    const p = presets[preset] || presets.indigoCyan;
    setPrimaryColor(p.primary);
    setAccentColor(p.accent);
  };

  // Save Rewards Settings
  const handleSaveRewardsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      stampsForFreeDrink: stampsForFree,
      pointsPerStamp,
      referralRewardStamps: referralStamps,
      surveyRewardPoints: surveyPoints,
    });
  };

  // Create Reward Item
  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewTitleEn || !newRewTitleAr) return;
    addRewardItem({
      titleEn: newRewTitleEn,
      titleAr: newRewTitleAr,
      descriptionEn: newRewDescEn,
      descriptionAr: newRewDescAr,
      pointsCost: Number(newRewCost),
      category: newRewCategory,
      icon: 'gift',
      available: true,
    });
    setNewRewTitleEn('');
    setNewRewTitleAr('');
    setNewRewDescEn('');
    setNewRewDescAr('');
    setShowAddReward(false);
  };

  // Create Barista
  const handleCreateBarista = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baristaName || !baristaPin) return;
    addBarista({
      name: baristaName,
      pin: baristaPin,
      branch: baristaBranch || 'Main Branch',
      active: true,
    });
    setBaristaName('');
    setBaristaPin('');
    setBaristaBranch('');
    setShowAddBarista(false);
  };

  // Save Zender Config
  const handleSaveZender = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      zender: {
        ...settings.zender,
        apiUrl: zenderUrl,
        apiKey: zenderKey,
        whatsappDeviceId: zenderDevice,
        enabled: zenderEnabled,
        welcomeTemplate: welcomeTpl,
        stampAddedTemplate: stampTpl,
        rewardRedeemedTemplate: redeemTpl,
        birthdayTemplate: birthdayTpl,
      },
    });
  };

  // Test Zender message
  const handleTestWhatsApp = async () => {
    setSendingTest(true);
    setTestResult(null);
    const res = await sendTestWhatsApp(testPhone, {
      apiUrl: zenderUrl,
      apiKey: zenderKey,
      whatsappDeviceId: zenderDevice,
      enabled: zenderEnabled,
    });
    setTestResult(res);
    setSendingTest(false);
  };

  // Send Broadcast Campaign
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignMsg) return;
    setBroadcasting(true);
    await sendBroadcast(
      campaignTitle,
      campaignTitle,
      campaignMsg,
      campaignMsg,
      targetTier,
      sendPush,
      sendWhatsApp
    );
    setCampaignTitle('');
    setCampaignMsg('');
    setBroadcasting(false);
  };

  // Analytics Computations
  const totalRegistered = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'approved').length;
  const totalStampsIssued = customers.reduce((acc, c) => acc + c.totalStampsCollected, 0);
  const freeDrinksGiven = transactions.filter((tx) => tx.type === 'stamp_redeem').length;
  const isSyrianCurrency = settings.currency === 'SYP' || settings.currency === 'ل.س';
  const avgCupPrice = isSyrianCurrency ? 35000 : 18;
  const estimatedRevenue = (totalStampsIssued * avgCupPrice).toLocaleString();
  const retentionRate = totalRegistered > 0 ? Math.round((activeCustomers / totalRegistered) * 100) : 100;

  // Filtered customer list
  const filteredCustomerList = customers.filter((c) => {
    const matchesFilter = customerFilter === 'all' ? true : c.status === customerFilter;
    const matchesQuery =
      customerSearch.trim() === '' ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.cardNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch);
    return matchesFilter && matchesQuery;
  });

  if (!isOwnerAuthenticated) {
    return <OwnerLogin />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Owner Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: settings.theme.primary }}
            >
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {t('ownerDashboardTitle')}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {isAr ? settings.shopNameAr : settings.shopNameEn} • {isAr ? 'الإدارة والتحليلات' : 'Management & Analytics'}
              </p>
            </div>
          </div>

          {/* Action buttons: PIN, Logout, and Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Category Dropdown Toggle Button */}
            <button
              type="button"
              id="owner-mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition active:scale-95"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle admin navigation menu"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأقسام' : 'Menu'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Change Owner PIN button */}
            <button
              type="button"
              id="owner-header-change-pin-btn"
              onClick={() => setShowChangeOwnerPinModal(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-cyan-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold border border-indigo-300 dark:border-indigo-700 transition cursor-pointer"
              title={t('changeOwnerPinTitle')}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">{t('changeOwnerPin')}</span>
            </button>

            <button
              type="button"
              id="owner-header-logout-btn"
              onClick={logoutOwner}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              title={t('ownerLogout')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('ownerLogout')}</span>
            </button>
          </div>
        </div>

        {/* Global Live WhatsApp status indicator */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] sm:text-xs">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${
              settings.zender.enabled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.zender.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>963 CRM: {settings.zender.enabled ? (isAr ? 'متصل ونشط' : 'Online & Ready') : (isAr ? 'محاكاة' : 'Simulated')}</span>
          </div>

          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            {isAr ? '9 أقسام لإدارة المقهى' : '9 Admin Modules'}
          </span>
        </div>
      </div>

      {/* Mobile-Friendly Navigation */}
      {/* 1. Mobile Expandable Menu Drawer (shown when user taps Menu or on small screens) */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400">
              {isAr ? 'اختر قسم الإدارة:' : 'Select Admin Section:'}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'analytics', label: t('tabAnalytics'), icon: BarChart3, desc: isAr ? 'المبيعات والأرقام' : 'Sales & Stats' },
              { key: 'branding', label: t('tabBranding'), icon: Palette, desc: isAr ? 'الهوية والألوان' : 'Colors & Theme' },
              { key: 'rewards', label: t('tabRewards'), icon: Award, desc: isAr ? 'كتالوج الهدايا' : 'Catalog & Perks' },
              { key: 'wheel', label: t('tabWheel'), icon: Sparkles, desc: isAr ? 'عجلة الحظ اليومية' : 'Lucky Wheel' },
              { key: 'customers', label: t('tabCustomers'), icon: Users, desc: isAr ? 'سجل العملاء' : 'Customer Roster' },
              { key: 'baristas', label: t('tabBaristas'), icon: Coffee, desc: isAr ? 'طاقم العمل' : 'Staff Members' },
              { key: 'zender', label: t('tabZender'), icon: MessageCircle, desc: isAr ? 'بوابة الواتساب' : 'WhatsApp API' },
              { key: 'feedback', label: t('tabFeedback'), icon: MessageSquare, desc: isAr ? 'تقييمات الزبائن' : 'Customer Reviews' },
              { key: 'broadcast', label: t('tabBroadcast'), icon: Send, desc: isAr ? 'حملات الرسائل' : 'Bulk Campaigns' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  id={`owner-mobile-tab-${tab.key}`}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-start transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                      {tab.label}
                    </p>
                    <p className={`text-[10px] leading-tight mt-0.5 truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Responsive Horizontal Scroll Tab Bar with Touch Optimization */}
      <div className="relative">
        <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 sm:bg-slate-100 sm:dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar shadow-xs border border-slate-200 dark:border-slate-800 sm:border-transparent">
          {[
            { key: 'analytics', label: t('tabAnalytics'), icon: BarChart3 },
            { key: 'branding', label: t('tabBranding'), icon: Palette },
            { key: 'rewards', label: t('tabRewards'), icon: Award },
            { key: 'wheel', label: t('tabWheel'), icon: Sparkles },
            { key: 'customers', label: t('tabCustomers'), icon: Users },
            { key: 'baristas', label: t('tabBaristas'), icon: Coffee },
            { key: 'zender', label: t('tabZender'), icon: MessageCircle },
            { key: 'feedback', label: t('tabFeedback'), icon: MessageSquare },
            { key: 'broadcast', label: t('tabBroadcast'), icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                id={`owner-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white sm:bg-white sm:text-slate-900 sm:dark:bg-slate-700 sm:dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 sm:hover:bg-transparent dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white sm:text-indigo-600 sm:dark:text-cyan-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Analytics & Sales Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalCustomers')}</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalRegistered}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+12% this week</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('activeThisMonth')}</span>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-cyan-400">{activeCustomers}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Approved pass users</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalStampsIssued')}</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalStampsIssued} ☕</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Issued via Baristas</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('freeDrinksGiven')}</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{freeDrinksGiven}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Completed 8/8 cards</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('estimatedRevenue')}</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {estimatedRevenue} <span className="text-xs font-normal">{settings.currency}</span>
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">From repeat cups</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('repeatRate')}</span>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{retentionRate}%</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">High brand loyalty</span>
            </div>
          </div>

          {/* Graphical Distributions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Peak Hours Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('peakHours')}
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { time: '07:00 AM - 10:00 AM (Morning Rush)', count: 48, pct: '85%' },
                  { time: '12:30 PM - 02:30 PM (Lunch Coffee)', count: 32, pct: '60%' },
                  { time: '04:00 PM - 08:00 PM (Evening Hangout)', count: 56, pct: '95%' },
                  { time: '08:00 PM - 11:30 PM (Late Night)', count: 24, pct: '45%' },
                ].map((slot, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.time}</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{slot.count} orders</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: slot.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Tier Distribution */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('tierDistribution')}
                </h3>
              </div>
              <div className="space-y-3">
                {Object.keys(TIER_CONFIGS).map((tierKey) => {
                  const tier = TIER_CONFIGS[tierKey as TierLevel];
                  const count = customers.filter((c) => c.tier === tierKey).length;
                  const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
                  return (
                    <div key={tierKey}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {isAr ? tier.nameAr : tier.nameEn}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: tier.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Branding & Themes Tab */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('tabBranding')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تخصيص اسم المقهى، الألوان، وشكل أيقونة الختم' : 'Customize shop name, color scheme palette, and stamp symbols'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('storeNameEn')}
              </label>
              <input
                type="text"
                value={shopNameEn}
                onChange={(e) => setShopNameEn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('storeNameAr')}
              </label>
              <input
                type="text"
                value={shopNameAr}
                onChange={(e) => setShopNameAr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('sloganEn')}
              </label>
              <input
                type="text"
                value={sloganEn}
                onChange={(e) => setSloganEn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('sloganAr')}
              </label>
              <input
                type="text"
                value={sloganAr}
                onChange={(e) => setSloganAr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('currency')}
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="SYP / ل.س"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs uppercase"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'SYP (ل.س)', value: 'SYP' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'AED (د.إ)', value: 'AED' },
                  { label: 'SAR (ر.س)', value: 'SAR' },
                ].map((cur) => (
                  <button
                    key={cur.value}
                    type="button"
                    onClick={() => setCurrency(cur.value)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                      currency === cur.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cur.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('stampIconStyle')}
              </label>
              <select
                value={stampIcon}
                onChange={(e) => setStampIcon(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="cup">{t('iconCup')}</option>
                <option value="bean">{t('iconBean')}</option>
                <option value="star">{t('iconStar')}</option>
                <option value="heart">{t('iconHeart')}</option>
              </select>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('themePreset')}
            </span>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'indigoCyan', label: t('presetIndigoCyan'), color: '#4f46e5' },
                { id: 'emeraldTeal', label: t('presetEmeraldTeal'), color: '#059669' },
                { id: 'violetAmber', label: t('presetVioletAmber'), color: '#7c3aed' },
                { id: 'skyBlue', label: t('presetSkyBlue'), color: '#0284c7' },
                { id: 'roseCoral', label: t('presetRoseCoral'), color: '#e11d48' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyColorPreset(p.id as any)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('primaryColor')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('accentColor')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono">{accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Owner & Admin Access Security PIN */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-950 dark:text-cyan-200 block">
                      {t('ownerPinLabel')}
                    </label>
                    <span className="text-[11px] text-indigo-800/80 dark:text-cyan-300/80">
                      {isAr ? 'الرمز المستخدم لحماية وفتح لوحة تحكم المالك' : 'Security PIN for unlocking Owner Dashboard'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="open-change-pin-modal-btn"
                  onClick={() => setShowChangeOwnerPinModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('changeOwnerPin')}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-900/80 dark:text-cyan-300/80 leading-relaxed">
                {t('ownerPinHelper')}
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={ownerPinSetting}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length <= 4) setOwnerPinSetting(val);
                    }}
                    placeholder="1234"
                    className="w-36 px-3 py-2 text-center tracking-[0.6em] font-mono text-base font-bold rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-xs"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isAr ? '(4 أرقام)' : '(4 digits)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const random = String(Math.floor(1000 + Math.random() * 9000));
                    setOwnerPinSetting(random);
                    triggerToast(
                      isAr
                        ? `تم توليد رمز PIN جديد (${random})! اضغط حفظ التعديلات بالأسفل.`
                        : `Generated new PIN (${random})! Click Save Changes below.`,
                      'info'
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100/50 dark:hover:bg-slate-800 text-indigo-800 dark:text-cyan-200 text-xs font-bold border border-indigo-300 dark:border-indigo-700 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                  <span>{t('generateRandomPin')}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
          >
            {t('saveBranding')}
          </button>
        </form>
      )}

      {/* 3. Rewards & Tiers Settings Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Global Rewards Rules Form */}
          <form onSubmit={handleSaveRewardsConfig} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'قواعد برنامج الولاء والأختام' : 'Loyalty Rules & Ratios'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('stampsForFreeTarget')}
                </label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={stampsForFree}
                  onChange={(e) => setStampsForFree(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('pointsPerStampRate')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={pointsPerStamp}
                  onChange={(e) => setPointsPerStamp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('referralStampsReward')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={referralStamps}
                  onChange={(e) => setReferralStamps(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('surveyBonusPoints')}
                </label>
                <input
                  type="number"
                  min={5}
                  value={surveyPoints}
                  onChange={(e) => setSurveyPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
            >
              {t('save')}
            </button>
          </form>

          {/* Tier Configuration Management */}
          <TierConfigSection />

          {/* Reward Catalog Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-600" />
                <span>{t('catalogRewards')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddReward(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addNewReward')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {isAr ? r.titleAr : r.titleEn}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
                        {r.pointsCost} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      {isAr ? r.descriptionAr : r.descriptionEn}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{r.category}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteRewardItem(r.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wheel Settings Tab */}
      {activeTab === 'wheel' && <WheelSettingsTab />}

      {/* 4. Customer CRM Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{t('tabCustomers')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'إدارة حسابات العملاء، تعديل البيانات والنقاط، وتفعيل أو تعطيل الحسابات'
                  : 'Manage customer accounts, edit points & stamps, and enable or disable access.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Issue Physical NFC Card Button */}
              <button
                type="button"
                id="owner-issue-nfc-card-btn"
                onClick={() => {
                  if (filteredCustomerList.length > 0) {
                    setNfcCustomer(filteredCustomerList[0]);
                    setShowNfcWriterModal(true);
                  } else if (customers.length > 0) {
                    setNfcCustomer(customers[0]);
                    setShowNfcWriterModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? 'إصدار وبرمجة بطاقة NFC' : 'Issue Physical NFC Card'}</span>
              </button>

              {/* Filter */}
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="all">{t('all')} ({customers.length})</option>
                <option value="approved">{isAr ? 'المعتمدين / النشطين' : 'Active / Approved'} ({customers.filter(c => c.status === 'approved').length})</option>
                <option value="suspended">{isAr ? 'المعطلين / الموقوفين' : 'Suspended / Disabled'} ({customers.filter(c => c.status === 'suspended').length})</option>
                <option value="pending">{isAr ? 'المعلقين' : 'Pending'} ({customers.filter(c => c.status === 'pending').length})</option>
              </select>

              {/* Search */}
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={t('search')}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-2">{t('fullName')}</th>
                  <th className="pb-3 px-2">{t('cardNumberPlaceholder')}</th>
                  <th className="pb-3 px-2">{t('phone')}</th>
                  <th className="pb-3 px-2">{t('stamps')}</th>
                  <th className="pb-3 px-2">{t('points')}</th>
                  <th className="pb-3 px-2">{t('memberTier')}</th>
                  <th className="pb-3 px-2">{t('status')}</th>
                  <th className="pb-3 px-2 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomerList.map((c) => {
                  const customerTierConfig = (tierConfigs || settings.tiers)?.[c.tier];
                  const tierColor = customerTierConfig?.color || '#b45309';
                  const tierName = isAr
                    ? customerTierConfig?.nameAr || c.tier
                    : customerTierConfig?.nameEn || c.tier;

                  return (
                    <tr key={c.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                        {c.dateOfBirth && (
                          <div className="text-[10px] text-slate-400">🎂 {c.dateOfBirth}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-indigo-600 dark:text-cyan-400 font-semibold">{c.cardNumber}</td>
                      <td className="py-3 px-2 font-mono text-slate-500">{c.phone}</td>
                      <td className="py-3 px-2 font-bold">{c.currentStamps}/{settings.stampsForFreeDrink || 8}</td>
                      <td className="py-3 px-2 font-bold font-mono">{c.totalPoints} pts</td>
                      <td className="py-3 px-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            borderColor: `${tierColor}40`,
                            backgroundColor: `${tierColor}15`,
                            color: tierColor,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: tierColor }}
                          />
                          <span>{tierName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1 ${
                            c.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : c.status === 'suspended'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-cyan-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'approved'
                                ? 'bg-emerald-500'
                                : c.status === 'suspended'
                                ? 'bg-rose-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <span>
                            {c.status === 'approved'
                              ? isAr
                                ? 'مفعل'
                                : 'Active'
                              : c.status === 'suspended'
                              ? isAr
                                ? 'معطل'
                                : 'Disabled'
                              : isAr
                              ? 'معلق'
                              : 'Pending'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Pending approvals */}
                          {c.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveCustomer(c.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500"
                                title={isAr ? 'اعتماد الحساب' : 'Approve Account'}
                              >
                                {isAr ? 'اعتماد' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectCustomer(c.id)}
                                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] hover:bg-slate-300"
                                title={isAr ? 'رفض' : 'Reject'}
                              >
                                {isAr ? 'رفض' : 'Reject'}
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit Customer Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCustomer(c);
                                  setShowCustomerEditModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-indigo-950/40 transition"
                                title={t('editCustomer')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Issue / Program Physical NFC Tag Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setNfcCustomer(c);
                                  setShowNfcWriterModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-indigo-950/40 transition"
                                title={isAr ? 'إصدار وبرمجة بطاقة NFC' : 'Issue / Program Physical NFC Card'}
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status (Disable / Enable) Button */}
                              <button
                                type="button"
                                onClick={() => toggleCustomerStatus(c.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  c.status === 'suspended'
                                    ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                }`}
                                title={
                                  c.status === 'suspended'
                                    ? isAr
                                      ? 'تفعيل الحساب'
                                      : 'Enable Account'
                                    : isAr
                                    ? 'تعطيل الحساب'
                                    : 'Disable Account'
                                }
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Customer Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      isAr
                                        ? `هل أنت متأكد من حذف حساب العميل ${c.name} نهائياً؟`
                                        : `Are you sure you want to delete customer ${c.name}?`
                                    )
                                  ) {
                                    deleteCustomer(c.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title={t('delete')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Barista Staff Tab */}
      {activeTab === 'baristas' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-indigo-600" />
              <span>{t('tabBaristas')}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddBarista(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addBarista')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {baristas.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.active !== false
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {b.active !== false ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                      </span>
                    </div>

                    {/* PIN pill with lock */}
                    <div className="flex items-center gap-1 font-mono font-bold text-xs bg-indigo-100 dark:bg-indigo-950/60 text-slate-900 dark:text-cyan-200 px-2.5 py-1 rounded-xl border border-indigo-300 dark:border-indigo-800">
                      <KeyRound className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
                      <span>PIN: {b.pin}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.branch || 'Main Branch'}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold">{b.totalStampsGiven || 0} {isAr ? 'ختم ممنوح' : 'stamps issued'}</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600 dark:text-cyan-400">{b.totalRedemptions || 0} {isAr ? 'مكافأة مسلّمة' : 'redeemed'}</span>
                  </div>
                </div>

                {/* Barista Card Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`barista-edit-btn-${b.id}`}
                      onClick={() => {
                        setEditingBarista(b);
                        setShowBaristaEditModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t('editBarista')}</span>
                    </button>

                    <button
                      type="button"
                      id={`barista-reset-pin-btn-${b.id}`}
                      onClick={() => {
                        setEditingBarista(b);
                        setShowBaristaEditModal(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                      title={t('resetBaristaPin')}
                    >
                      <KeyRound className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
                      <span>{t('resetBaristaPin')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          isAr
                            ? `هل تريد بالتأكيد حذف حساب الباريستا ${b.name}؟`
                            : `Are you sure you want to delete barista ${b.name}?`
                        )
                      ) {
                        deleteBarista(b.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 963 CRM WhatsApp & SMS Integration Tab */}
      {activeTab === 'zender' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveZender} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('zenderTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('zenderDesc')}
                  </p>
                </div>
              </div>

              {/* Enable toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zenderEnabled}
                  onChange={(e) => setZenderEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-xs font-bold">{t('enableZender')}</span>
              </label>
            </div>

            {/* API Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('zenderApiUrl')}
                </label>
                <input
                  type="url"
                  value={zenderUrl}
                  onChange={(e) => setZenderUrl(e.target.value)}
                  placeholder="https://crm.963s.co/api/send/whatsapp"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'مثال: https://crm.963s.co أو مسار API: https://crm.963s.co/api/send/whatsapp' : 'e.g. https://crm.963s.co or full /api/send/whatsapp'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('zenderApiKey')}
                </label>
                <input
                  type="password"
                  value={zenderKey}
                  onChange={(e) => setZenderKey(e.target.value)}
                  placeholder="Secret key..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'المفتاح السري من لوحة 963 CRM > صفحة API' : 'Secret Key from 963 CRM > API page'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('whatsappDeviceId')}</span>
                  <span className="text-[10px] text-red-500 font-bold">* {isAr ? 'مطلوب في 963 CRM' : 'Required for 963 CRM'}</span>
                </label>
                <input
                  type="text"
                  value={zenderDevice}
                  onChange={(e) => setZenderDevice(e.target.value)}
                  placeholder={isAr ? 'معرف الحساب (مثال: 1 أو المعرف الفريد)' : 'e.g. 1 or account unique ID'}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono ${
                    !zenderDevice.trim() ? 'border-indigo-400 dark:border-indigo-600' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                <p className="text-[10px] text-indigo-600 dark:text-cyan-400 mt-1">
                  {isAr
                    ? '⚠️ انسخ معرّف الحساب الفريد (Account ID) من صفحة 963 CRM > WhatsApp > Accounts (حسابات الواتساب المرتبطة)'
                    : '⚠️ Copy the unique Account ID from 963 CRM > WhatsApp > Accounts'}
                </p>
              </div>
            </div>

            {/* Message Templates */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('templatesHeader')}
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-cyan-400 font-mono">
                  {t('templateVariablesHelp')}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('welcomeTemplateLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={welcomeTpl}
                    onChange={(e) => setWelcomeTpl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('stampTemplateLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={stampTpl}
                    onChange={(e) => setStampTpl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('redeemTemplateLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={redeemTpl}
                    onChange={(e) => setRedeemTpl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('birthdayTemplateLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={birthdayTpl}
                    onChange={(e) => setBirthdayTpl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
            >
              {t('saveZenderSettings')}
            </button>
          </form>

          {/* Test WhatsApp tool */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>{t('testZenderConnection')}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'يتم الاختبار عبر خادم 963 CRM المباشر' : 'Live 963 CRM gateway test'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+963 933 123 456"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={sendingTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingTest ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جاري الإرسال عبر 963 CRM...' : 'Dispatching via 963 CRM...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('sendTestBtn')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Feedback & Diagnostics */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>
                        {testResult.success
                          ? (isAr ? '✅ تم تسليم الرسالة لبوابة 963 CRM بنجاح!' : '✅ Message successfully queued/sent by 963 CRM!')
                          : (isAr ? '❌ تعذر استلام الرسالة من خلال 963 CRM' : '❌ 963 CRM Gateway Dispatch Failed')}
                      </span>
                      {testResult.statusCode && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-semibold">
                          HTTP {testResult.statusCode}
                        </span>
                      )}
                    </div>

                    {!testResult.success && testResult.error && (
                      <p className="font-mono text-[11px] bg-red-100/80 dark:bg-red-900/40 p-2 rounded-lg text-red-800 dark:text-red-200">
                        {testResult.error}
                      </p>
                    )}

                    {testResult.details && (
                      <details className="text-[10px] opacity-80 cursor-pointer pt-1">
                        <summary className="font-semibold">{isAr ? 'عرض رد السيرفر الكامل' : 'View server response payload'}</summary>
                        <pre className="mt-1 p-2 rounded bg-black/10 dark:bg-white/10 overflow-x-auto whitespace-pre-wrap font-mono">
                          {testResult.details}
                        </pre>
                      </details>
                    )}

                    {testResult.endpointUsed && (
                      <p className="text-[10px] opacity-75 font-mono">
                        {isAr ? 'الرابط المستخدم: ' : 'Endpoint: '} {testResult.endpointUsed}
                      </p>
                    )}

                    {!testResult.success && (
                      <div className="pt-2 border-t border-red-200 dark:border-red-800/60 mt-2 space-y-1.5 text-[11px]">
                        <p className="font-bold">{isAr ? 'سبب خطأ (Invalid Parameters 400) في 963 CRM وكيفية حله:' : 'Why 963 CRM returns 400 Invalid Parameters & How to fix:'}</p>
                        <div className="p-2.5 rounded-xl bg-red-100/70 dark:bg-red-900/30 space-y-1 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {isAr ? '1. حقل معرّف الحساب (WhatsApp Account ID):' : '1. WhatsApp Account ID is Required:'}
                          </p>
                          <p className="text-[11px] opacity-90">
                            {isAr
                              ? 'في منصة 963 CRM يجب إرسال parameter اسمه (account). ادخل إلى لوحة تحكم 963 CRM الخاصة بك ثم اذهب إلى: WhatsApp > Accounts، وانسخ معرّف حساب الواتساب الخاص بك وضعه في خانة "WhatsApp Device / Account ID" أعلاه.'
                              : 'In 963 CRM, the "account" parameter is mandatory. Go to your 963 CRM panel > WhatsApp > Accounts, find your linked WhatsApp account and copy its Account ID into the field above.'}
                          </p>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 opacity-90 text-[11px] pt-1">
                          <li>{isAr ? 'تأكد من عنوان الرابط: https://crm.963s.co/api/send/whatsapp' : 'Verify URL: https://crm.963s.co/api/send/whatsapp'}</li>
                          <li>{isAr ? 'تأكد من المفتاح السري (Secret Key) من صفحة API في 963 CRM' : 'Verify Secret Key from 963 CRM > API page'}</li>
                          <li>{isAr ? 'تأكد من أن حساب الواتساب في 963 CRM مرتبط ومسح كود QR ومكتوب بالخانة (Device ID)' : 'Ensure your WhatsApp account in 963 CRM is linked via QR code and written in Device ID field'}</li>
                          <li>{isAr ? 'تأكد من كتابة رقم الهاتف بالصيغة الدولية مع مفتاح الدولة (مثل: +963933123456)' : 'Ensure phone number is in international format (e.g. +963933123456)'}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Logs History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('whatsAppLogs')}
            </h3>

            {whatsAppLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">{t('noLogs')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {whatsAppLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.customerName}</span>
                        <span className="font-mono text-slate-500">({log.recipientPhone})</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-cyan-300 font-bold">
                          {log.templateType}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{log.message}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Customer Surveys & Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('qualityRating'), score: '4.9 ★' },
              { label: t('serviceRating'), score: '4.8 ★' },
              { label: t('ambianceRating'), score: '4.7 ★' },
              { label: t('speedRating'), score: '4.6 ★' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">{item.label}</span>
                <span className="text-lg font-bold text-indigo-500">{item.score}</span>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'آراء وملاحظات العملاء الحديثة' : 'Customer Survey Submissions'}</span>
            </h3>

            {feedbackList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No feedback yet</p>
            ) : (
              <div className="space-y-3">
                {feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{fb.customerName}</span>
                      <span className="text-xs font-bold text-indigo-500">{fb.overallRating} ★</span>
                    </div>
                    {fb.comment && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        "{fb.comment}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(fb.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Campaign Broadcaster Tab */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleSendCampaign} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('broadcastTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('broadcastDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('campaignTitle')}
              </label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder={isAr ? 'عرض عطلة نهاية الأسبوع: أختام مضاعفة!' : 'Weekend Special: Double Coffee Stamps!'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('campaignMessage')}
              </label>
              <textarea
                rows={3}
                required
                value={campaignMsg}
                onChange={(e) => setCampaignMsg(e.target.value)}
                placeholder={isAr ? 'زُرنا اليوم واستمتع بختمين إضافيين مع كل طلب قهوة مختصة...' : 'Visit us today and receive double stamps on all specialty coffees...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('targetAudience')}
                </label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                >
                  <option value="all">{t('allCustomers')} ({customers.filter(c => c.status === 'approved').length})</option>
                  <option value="bronze">{isAr ? 'المستوى البرونزي' : 'Bronze Tier'}</option>
                  <option value="silver">{isAr ? 'المستوى الفضي' : 'Silver Tier'}</option>
                  <option value="gold">{isAr ? 'المستوى الذهبي' : 'Gold Tier'}</option>
                  <option value="platinum">{isAr ? 'المستوى البلاتيني' : 'Platinum Tier'}</option>
                </select>
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-4 h-4 accent-amber-600"
                  />
                  <span>{t('channelPush')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>{t('channelWhatsApp')} (963 CRM)</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={broadcasting}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${broadcasting ? 'animate-spin' : ''}`} />
            <span>{broadcasting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : t('sendBroadcastBtn')}</span>
          </button>
        </form>
      )}

      {/* Modal: Add Reward */}
      {showAddReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowAddReward(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold mb-4">{t('addNewReward')}</h3>
            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('rewardTitleEn')}</label>
                <input
                  type="text"
                  required
                  value={newRewTitleEn}
                  onChange={(e) => setNewRewTitleEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('rewardTitleAr')}</label>
                <input
                  type="text"
                  required
                  value={newRewTitleAr}
                  onChange={(e) => setNewRewTitleAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('pointsCost')}</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newRewCost}
                    onChange={(e) => setNewRewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('category')}</label>
                  <select
                    value={newRewCategory}
                    onChange={(e) => setNewRewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="drink">Drink</option>
                    <option value="pastry">Pastry</option>
                    <option value="beans">Coffee Beans</option>
                    <option value="merch">Merchandise</option>
                    <option value="discount">Discount Coupon</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {t('saveReward')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Barista */}
      {showAddBarista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowAddBarista(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold mb-4">{t('addBarista')}</h3>
            <form onSubmit={handleCreateBarista} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('baristaName')}</label>
                <input
                  type="text"
                  required
                  value={baristaName}
                  onChange={(e) => setBaristaName(e.target.value)}
                  placeholder="e.g. Faisal Al-Harbi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('baristaPin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={baristaPin}
                  onChange={(e) => setBaristaPin(e.target.value)}
                  placeholder="4 digits PIN (e.g. 7788)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-center tracking-widest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('baristaBranch')}</label>
                <input
                  type="text"
                  value={baristaBranch}
                  onChange={(e) => setBaristaBranch(e.target.value)}
                  placeholder="e.g. Downtown Branch"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {t('saveBarista')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Owner PIN */}
      <ChangeOwnerPinModal
        isOpen={showChangeOwnerPinModal}
        onClose={() => setShowChangeOwnerPinModal(false)}
      />

      {/* Modal: Edit Barista & Reset PIN */}
      <BaristaEditModal
        isOpen={showBaristaEditModal}
        barista={editingBarista}
        onClose={() => {
          setShowBaristaEditModal(false);
          setEditingBarista(null);
        }}
        onSave={(updated) => {
          updateBarista(updated);
        }}
      />

      {/* Modal: Edit Customer Account (CRM) */}
      <CustomerEditModal
        isOpen={showCustomerEditModal}
        customer={editingCustomer}
        onClose={() => {
          setShowCustomerEditModal(false);
          setEditingCustomer(null);
        }}
        onSave={(updated) => {
          updateCustomer(updated);
        }}
        onToggleStatus={(customerId, newStatus) => {
          toggleCustomerStatus(customerId, newStatus);
        }}
      />

      {/* Modal: Issue & Program Physical NFC Loyalty Card */}
      {nfcCustomer && (
        <NfcTagWriterModal
          isOpen={showNfcWriterModal}
          onClose={() => {
            setShowNfcWriterModal(false);
            setNfcCustomer(null);
          }}
          customer={nfcCustomer}
        />
      )}
    </div>
  );
};
