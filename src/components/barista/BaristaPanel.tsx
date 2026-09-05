import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Gift,
  KeyRound,
  LogOut,
  Plus,
  QrCode,
  Radio,
  Search,
  Sparkles,
  Ticket,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp, TIER_CONFIGS } from '../../context/AppContext';
import { Customer } from '../../types';
import { QrScanner } from '../common/QrScanner';
import { NfcScannerModal } from './NfcScannerModal';

export const BaristaPanel: React.FC = () => {
  const {
    baristas,
    activeBarista,
    baristaLogin,
    logoutBarista,
    setActiveBarista,
    setRole,
    customers,
    settings,
    addStamps,
    redeemFreeDrink,
    redeemCatalogReward,
    redeemCoupon,
    approveCustomer,
    rejectCustomer,
    registerCustomer,
    rewards,
    transactions,
    language,
    t,
    triggerToast,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'approvals' | 'add_cust' | 'shift'>('scan');
  
  // Quick stamps quantity
  const [stampsCount, setStampsCount] = useState(1);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustDob, setNewCustDob] = useState('');

  // Scanner Modals
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);

  // Barista PIN auth
  const [pinInput, setPinInput] = useState('');

  const isAr = language === 'ar';

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;
  const pendingCustomers = customers.filter((c) => c.status === 'pending');

  // Filtered search
  const filteredCustomers = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Robust QR Code payload decoder
  const handleQrScanSuccess = (decodedText: string) => {
    const raw = (decodedText || '').trim();
    console.log('[QR Decoded]:', raw);

    // 1. Direct card number match (case insensitive)
    let found = customers.find(
      (c) => c.cardNumber.toLowerCase() === raw.toLowerCase()
    );

    // 2. Extract from URL e.g. https://.../?card=COFFEE-...
    if (!found && (raw.includes('?card=') || raw.includes('&card='))) {
      try {
        const urlObj = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
        const cardParam = urlObj.searchParams.get('card');
        if (cardParam) {
          found = customers.find(
            (c) => c.cardNumber.toLowerCase() === cardParam.toLowerCase()
          );
        }
      } catch (e) {
        const match = raw.match(/card=([A-Za-z0-9\-]+)/);
        if (match && match[1]) {
          found = customers.find(
            (c) => c.cardNumber.toLowerCase() === match[1].toLowerCase()
          );
        }
      }
    }

    // 3. Extract from JSON format
    if (!found && raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.card) {
          found = customers.find(
            (c) => c.cardNumber.toLowerCase() === parsed.card.toLowerCase()
          );
        }
      } catch (e) {
        // ignore
      }
    }

    // 4. Regex match standard pattern COFFEE-XXXX-YYYY
    if (!found) {
      const match = raw.match(/COFFEE-[A-Z0-9]+-[A-Z0-9]+/i);
      if (match) {
        found = customers.find(
          (c) => c.cardNumber.toLowerCase() === match[0].toLowerCase()
        );
      }
    }

    // 5. Match by phone or ID
    if (!found) {
      found = customers.find((c) => c.phone.includes(raw) || c.id === raw);
    }

    if (found) {
      setSelectedCustomerId(found.id);
      triggerToast(
        isAr ? `تم مسح رمز QR بنجاح: ${found.name}` : `QR Code Scanned: ${found.name}`,
        'success'
      );
    } else {
      triggerToast(
        isAr
          ? `تم مسح الرمز (${raw}) ولكن لم يتم العثور على بطاقة عميل مطابقة.`
          : `Scanned: "${raw}" (No matching customer found)`,
        'warning'
      );
    }
  };

  // Quick select customer
  const selectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setSearchQuery('');
    setShowQrScanner(false);
    triggerToast(isAr ? `تم تحديد العميل: ${cust.name}` : `Selected ${cust.name}`);
  };

  // Handle Issue Stamps
  const handleGiveStamps = async () => {
    if (!selectedCustomer) return;
    await addStamps(selectedCustomer.id, stampsCount, activeBarista ? activeBarista.name : 'Barista');
    setStampsCount(1);
  };

  // Handle Barista Add New Customer
  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const res = registerCustomer(newCustName, newCustPhone, newCustDob);
    // Instant approve in counter
    await approveCustomer(res.customer.id);
    setSelectedCustomerId(res.customer.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustDob('');
    setActiveTab('scan');
    triggerToast(t('customerAddedSuccess'));
  };

  // If no barista logged in
  if (!activeBarista) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {t('baristaTitle')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-6">
            {isAr ? 'أدخل رمز PIN للدخول إلى كاونتر ونقاط بيع الباريستا' : 'Enter 4-digit PIN to access Barista POS'}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              baristaLogin(pinInput);
            }}
            className="space-y-4"
          >
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-40 mx-auto px-4 py-3 text-center tracking-[1em] font-mono text-2xl rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md"
            >
              {isAr ? 'تسجيل الدخول للكاونتر' : 'Enter Counter'}
            </button>
          </form>

          {/* Quick Demo Baristas */}
          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-left rtl:text-right space-y-3">
            <span className="text-[11px] font-semibold text-stone-400 block mb-2">
              {isAr ? 'الحسابات المتاحة للتجربة:' : 'Demo Barista Accounts:'}
            </span>
            <div className="space-y-1.5">
              {baristas.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => baristaLogin(b.pin)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 transition cursor-pointer"
                >
                  <span>{b.name} ({b.branch})</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">PIN: {b.pin}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition"
              >
                {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{isAr ? 'العودة لتطبيق العملاء' : 'Back to Customer App'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Barista Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t('baristaTitle')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {t('statusActive')}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {activeBarista.name} • {activeBarista.branch}
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'scan'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t('quickScanner')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'approvals'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('pendingApprovalsTab')}</span>
              {pendingCustomers.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {pendingCustomers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add_cust')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'add_cust'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('addNewCustomer')}</span>
            </button>
          </div>

          <button
            type="button"
            id="barista-pos-logout-btn"
            onClick={logoutBarista}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs font-bold border border-stone-300 dark:border-stone-700 transition cursor-pointer"
            title={t('baristaLogout')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('baristaLogout')}</span>
          </button>
        </div>
      </div>

      {/* Tab: Quick Scanner & Customer Actions */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Scanning Hub */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search Input Box */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200 dark:border-stone-800">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                {t('manualSearch')}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute top-3.5 left-3.5 text-stone-400 rtl:right-3.5 rtl:left-auto" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full py-2.5 px-10 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Filtered Search Results Dropdown */}
              {filteredCustomers.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-stone-700 text-left rtl:text-right border border-stone-200/60 dark:border-stone-700 transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{c.name}</p>
                        <p className="text-[10px] font-mono text-stone-500">{c.cardNumber} • {c.phone}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        {c.currentStamps}/8 ☕
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Camera & NFC Scanner Box */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {t('quickScanner')} (QR & NFC)
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Live Scanner
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="barista-camera-toggle-btn"
                  onClick={() => setShowQrScanner(true)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold transition shadow-sm hover:opacity-90 active:scale-98 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                  <span>{t('cameraScanner')}</span>
                </button>

                <button
                  type="button"
                  id="barista-nfc-scan-btn"
                  onClick={() => setShowNfcModal(true)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>{t('nfcScanBtn')}</span>
                </button>
              </div>

              {/* Quick Preset Customers Bar */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-semibold text-stone-400 block mb-1.5 uppercase">
                  {isAr ? 'تحديد بطاقة عميل سريعاً للتجربة:' : 'Quick Select Customer:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customers.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        selectedCustomerId === c.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      {c.name.split(' ')[0]} ({c.currentStamps}/8)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Action Desk */}
          <div className="lg:col-span-7">
            {selectedCustomer ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 space-y-6">
                {/* Customer Profile Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        {selectedCustomer.name}
                      </h3>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {isAr
                          ? TIER_CONFIGS[selectedCustomer.tier].nameAr
                          : TIER_CONFIGS[selectedCustomer.tier].nameEn}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-stone-500 mt-0.5">
                      {selectedCustomer.cardNumber} • {selectedCustomer.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-400 block">{t('pointsBalance')}</span>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                      {selectedCustomer.totalPoints} pts
                    </span>
                  </div>
                </div>

                {/* Stamps Status Visual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {t('stampProgress')} ({selectedCustomer.currentStamps} / {settings.stampsForFreeDrink || 8})
                    </span>
                    {selectedCustomer.currentStamps >= (settings.stampsForFreeDrink || 8) && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        {t('congratsFreeDrink')}
                      </span>
                    )}
                  </div>

                  {/* Stamp grid */}
                  <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                    {Array.from({ length: settings.stampsForFreeDrink || 8 }).map((_, i) => {
                      const isStamped = i < selectedCustomer.currentStamps;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center aspect-square rounded-xl text-xs font-bold ${
                            isStamped
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
                          }`}
                        >
                          {isStamped ? '☕' : i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Issue Stamps Action Desk */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                    {t('addStamps')}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 dark:text-stone-300">{t('selectDrinkCount')}</span>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStampsCount(num)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          stampsCount === num
                            ? 'bg-amber-600 text-white shadow-md scale-105'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    id="barista-confirm-stamps-btn"
                    onClick={handleGiveStamps}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('giveStampsBtn')} (+{stampsCount} {isAr ? 'أختام' : 'stamps'})</span>
                  </button>
                </div>

                {/* Redeem Free Drink / Rewards */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'خيارات الاستبدال والمكافآت' : 'Redemption Options'}
                  </span>

                  {/* Redeem 8-stamp Free Drink */}
                  <button
                    type="button"
                    id="barista-redeem-free-drink-btn"
                    onClick={() => redeemFreeDrink(selectedCustomer.id, activeBarista.name)}
                    disabled={selectedCustomer.currentStamps < (settings.stampsForFreeDrink || 8)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{t('redeemFreeDrinkBtn')}</span>
                  </button>

                  {/* Active Customer Coupons (if any) */}
                  {selectedCustomer.coupons.filter((c) => !c.used).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-stone-500 uppercase">
                        {isAr ? 'كوبونات العميل الجاهزة للاستبدال:' : 'Customer Active Coupons:'}
                      </span>
                      {selectedCustomer.coupons
                        .filter((c) => !c.used)
                        .map((cp) => (
                          <div
                            key={cp.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                          >
                            <div>
                              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                {isAr ? cp.titleAr : cp.titleEn}
                              </p>
                              <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{cp.code}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => redeemCoupon(selectedCustomer.id, cp.id, activeBarista.name)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                            >
                              {t('redeemCoupon')}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 shadow-sm border border-stone-200 dark:border-stone-800 text-center text-stone-400">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <h4 className="text-base font-bold text-stone-700 dark:text-stone-300">
                  {t('noCustomerSelected')}
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  {isAr
                    ? 'امسح رمز QR الخاص ببطاقة العميل أو استخدم البحث السريع برقم البطاقة للبدء بختم الأكواب.'
                    : 'Scan the customer QR code or enter card number to issue stamps and redeem rewards.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span>{t('pendingApprovalsTab')}</span>
            </h3>
            <span className="text-xs text-stone-400">
              {pendingCustomers.length} {isAr ? 'طلبات بانتظار الاعتماد' : 'pending requests'}
            </span>
          </div>

          {pendingCustomers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p>{t('noPendingApprovals')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{cust.name}</h4>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {cust.cardNumber}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {cust.phone} • {isAr ? 'تاريخ التسجيل:' : 'Joined:'} {new Date(cust.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => approveCustomer(cust.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('approveCustomerBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => rejectCustomer(cust.id)}
                      className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 text-stone-600 dark:text-stone-300 font-bold text-xs transition"
                    >
                      {t('rejectCustomerBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Rapid Customer Add */}
      {activeTab === 'add_cust' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t('addNewCustomer')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isAr ? 'تسجيل عميل جديد واعتماده فورياً وإرسال رسالة ترحيب واتساب' : 'Instant in-store customer onboarding with automated WhatsApp'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAddNewCustomer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                required
                placeholder={isAr ? 'مثال: محمد الشريف' : 'e.g. Michael Jordan'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('phone')} * (WhatsApp)
              </label>
              <input
                type="tel"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                required
                placeholder="+963 933 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('dob')} 🎂
              </label>
              <input
                type="date"
                value={newCustDob}
                onChange={(e) => setNewCustDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('quickAddBtn')}</span>
            </button>
          </form>
        </div>
      )}

      {/* High-Precision Camera QR Scanner Modal */}
      <QrScanner
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanSuccess={handleQrScanSuccess}
        title={isAr ? 'مسح رمز بطاقة العميل (QR)' : 'Scan Customer QR Pass'}
        subtitle={isAr ? 'وجّه كاميرا الجوال نحو رمز QR للبطاقة' : 'Align the customer QR code inside the square frame'}
      />

      {/* NFC Reader & Emulation Modal */}
      <NfcScannerModal
        isOpen={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        onCustomerSelected={(cust) => {
          setSelectedCustomerId(cust.id);
        }}
        onOpenQrScanner={() => setShowQrScanner(true)}
      />
    </div>
  );
};
