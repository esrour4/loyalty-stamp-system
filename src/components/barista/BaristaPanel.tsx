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
  CreditCard,
  Gift,
  KeyRound,
  LogOut,
  Plus,
  QrCode,
  Radio,
  Search,
  Sparkles,
  RotateCcw,
  Tag,
  Ticket,
  UserCheck,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { QrScanner } from '../common/QrScanner';
import { NfcScannerModal } from './NfcScannerModal';
import { NfcTagWriterModal } from '../common/NfcTagWriterModal';
import { StampRewardsExchangeModal } from './StampRewardsExchangeModal';
import { CustomerMenuView } from '../menu/CustomerMenuView';

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
  const [activeTab, setActiveTab] = useState<'scan' | 'menu' | 'approvals' | 'add_cust' | 'shift'>('scan');
  
  // Quick stamps quantity
  const [stampsCount, setStampsCount] = useState(1);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustDob, setNewCustDob] = useState('');

  // Scanner Modals
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [showNfcWriterModal, setShowNfcWriterModal] = useState(false);
  const [showStampRewardsModal, setShowStampRewardsModal] = useState(false);

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

    // 4. Regex match numeric or legacy card pattern
    if (!found) {
      const numMatch = raw.match(/\b\d{4,10}\b/);
      if (numMatch) {
        found = customers.find((c) => c.cardNumber === numMatch[0]);
      }
      if (!found) {
        const legacyMatch = raw.match(/COFFEE-[A-Z0-9\-]+/i);
        if (legacyMatch) {
          found = customers.find(
            (c) => c.cardNumber.toLowerCase() === legacyMatch[0].toLowerCase()
          );
        }
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
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('baristaTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
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
              className="w-40 mx-auto px-4 py-3 text-center tracking-[1em] font-mono text-2xl rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md cursor-pointer transition active:scale-98"
            >
              {isAr ? 'تسجيل الدخول للكاونتر' : 'Enter Counter'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition cursor-pointer"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'العودة لتطبيق العملاء' : 'Back to Customer App'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Barista Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('baristaTitle')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {t('statusActive')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeBarista.name} • {activeBarista.branch}
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'scan'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t('quickScanner')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'menu'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{isAr ? 'قائمة المشروبات والأسعار' : 'Cafe Menu'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'approvals'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('manualSearch')}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute top-3.5 left-3.5 text-slate-400 rtl:right-3.5 rtl:left-auto" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full py-2.5 px-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 text-left rtl:text-right border border-slate-200/60 dark:border-slate-700 transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{c.cardNumber} • {c.phone}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-amber-800 dark:bg-amber-900/50 dark:text-cyan-300">
                        {c.currentStamps}/8 ☕
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Counter Scanner Hub: QR Code vs Physical Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isAr ? 'خيارات استقبال العميل بالكاونتر' : 'Counter Reception Scanner'}</span>
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Ready
                </span>
              </div>

              {/* Two primary scanning buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Scan QR Code via Camera */}
                <button
                  type="button"
                  id="barista-camera-toggle-btn"
                  onClick={() => setShowQrScanner(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm hover:opacity-90 active:scale-98 transition cursor-pointer border border-slate-800 dark:border-slate-200 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-cyan-400 dark:text-indigo-600 flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold block mb-0.5">
                    {isAr ? 'مسح رمز QR' : 'Scan QR Code'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-600 leading-tight">
                    {isAr ? 'من شاشة جوال العميل' : 'From customer phone'}
                  </span>
                </button>

                {/* 2. Scan Physical Card via NFC */}
                <button
                  type="button"
                  id="barista-nfc-scan-btn"
                  onClick={() => setShowNfcModal(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm active:scale-98 transition cursor-pointer text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold block mb-0.5">
                    {isAr ? 'مسح بطاقة ملموسة' : 'Scan Physical Card'}
                  </span>
                  <span className="text-[10px] text-amber-100 leading-tight">
                    {isAr ? 'تمرير بطاقة أو ميدالية NFC' : 'Tap plastic card / NFC tag'}
                  </span>
                </button>
              </div>

              {/* Issue Physical Card Quick Trigger */}
              {selectedCustomer && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNfcWriterModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-amber-900 dark:text-cyan-200 border border-indigo-300/60 dark:border-indigo-700/60 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>
                      {isAr
                        ? `إصدار وبرمجة بطاقة NFC لـ ${selectedCustomer.name}`
                        : `Issue Physical NFC Card for ${selectedCustomer.name}`}
                    </span>
                  </button>
                </div>
              )}

              {/* Quick Preset Customers Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
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
                          ? 'bg-amber-500 text-white border-indigo-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
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
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                {/* Customer Profile Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {selectedCustomer.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {isAr ? 'عضو ولاء' : 'Loyalty Member'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {selectedCustomer.cardNumber} • {selectedCustomer.phone}
                    </p>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-xs font-bold text-slate-400 block">{isAr ? 'رصيد الأختام' : 'Stamps Count'}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                      {selectedCustomer.currentStamps} / {settings.stampsForFreeDrink || 8}
                    </span>
                    <button
                      type="button"
                      id="barista-quick-redeem-gifts-link"
                      onClick={() => setShowStampRewardsModal(true)}
                      className="mt-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:text-cyan-300 border border-indigo-300/60 dark:border-indigo-700/60 cursor-pointer flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto transition active:scale-95"
                    >
                      <Gift className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
                      <span>{isAr ? 'كتالوج استبدال الأختام' : 'Exchange Stamps'}</span>
                    </button>
                  </div>
                </div>

                {/* Stamps Status Visual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('stampProgress')} ({selectedCustomer.currentStamps} / {settings.stampsForFreeDrink || 8})
                    </span>
                    {selectedCustomer.currentStamps >= (settings.stampsForFreeDrink || 8) && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        {t('congratsFreeDrink')}
                      </span>
                    )}
                  </div>

                  {/* Stamp grid */}
                  <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    {Array.from({ length: settings.stampsForFreeDrink || 8 }).map((_, i) => {
                      const isStamped = i < selectedCustomer.currentStamps;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center aspect-square rounded-xl text-xs font-bold ${
                            isStamped
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isStamped ? '☕' : i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Issue Stamps Action Desk */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                  <span className="text-xs font-bold text-amber-900 dark:text-cyan-200 block">
                    {t('addStamps')}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{t('selectDrinkCount')}</span>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStampsCount(num)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          stampsCount === num
                            ? 'bg-indigo-600 text-white shadow-md scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('giveStampsBtn')} (+{stampsCount} {isAr ? 'أختام' : 'stamps'})</span>
                  </button>
                </div>

                {/* Redeem Free Drink / Rewards */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? 'خيارات الاستبدال والمكافآت' : 'Redemption Options'}
                  </span>

                  {/* 1. Redeem 8-stamp Free Drink */}
                  <button
                    type="button"
                    id="barista-redeem-free-drink-btn"
                    onClick={() => redeemFreeDrink(selectedCustomer.id, activeBarista.name)}
                    disabled={selectedCustomer.currentStamps < (settings.stampsForFreeDrink || 8)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{t('redeemFreeDrinkBtn')}</span>
                  </button>

                  {/* 2. Stamp Rewards Exchange Hub */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent border border-indigo-400/40 dark:border-indigo-700/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {isAr ? 'كتالوج استبدال مكافآت الأختام' : 'Stamp Rewards Exchange'}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {isAr ? 'استبدال الأختام بمشروبات، مخبوزات، أو بن' : 'Exchange stamps for drinks, bakery & beans'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right rtl:text-left">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                          {selectedCustomer.currentStamps} {isAr ? 'أختام' : 'stamps'}
                        </span>
                      </div>
                    </div>

                    {/* Quick In-Desk Eligible Rewards */}
                    {rewards.filter((r) => r.available !== false && selectedCustomer.currentStamps >= (r.stampsCost || 4)).length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isAr ? 'مكافآت جاهزة للاستبدال بالأختام:' : 'Rewards ready for stamp exchange:'}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {rewards
                            .filter((r) => r.available !== false && selectedCustomer.currentStamps >= (r.stampsCost || 4))
                            .slice(0, 4)
                            .map((reward) => {
                              const cost = reward.stampsCost || 4;
                              return (
                                <div
                                  key={reward.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                  <div className="truncate mr-2 rtl:mr-0 rtl:ml-2">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                                      {isAr ? reward.titleAr : reward.titleEn}
                                    </p>
                                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                      {cost} {isAr ? 'أختام' : 'stamps'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await redeemCatalogReward(selectedCustomer.id, reward.id, activeBarista.name);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold whitespace-nowrap shadow-2xs transition active:scale-95 cursor-pointer"
                                  >
                                    {isAr ? 'استبدال' : 'Exchange'}
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-[11px] text-slate-500 text-center">
                        {isAr
                          ? `رصيد العميل الحالي (${selectedCustomer.currentStamps} أختام). يحتاج إلى أختام إضافية لفتح مكافآت الكتالوج.`
                          : `Customer has ${selectedCustomer.currentStamps} stamps. Needs more stamps for catalog rewards.`}
                      </div>
                    )}

                    {/* Launch Full Catalog Modal Button */}
                    <button
                      type="button"
                      id="barista-open-stamp-catalog-btn"
                      onClick={() => setShowStampRewardsModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تصفح كافة مكافآت الأختام' : 'Browse All Stamp Rewards'}</span>
                    </button>
                  </div>

                  {/* 3. Active Customer Coupons (if any) */}
                  {selectedCustomer.coupons.filter((c) => !c.used).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {isAr ? 'كوبونات العميل الجاهزة للاستبدال:' : 'Customer Active Coupons:'}
                      </span>
                      {selectedCustomer.coupons
                        .filter((c) => !c.used)
                        .map((cp) => (
                          <div
                            key={cp.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {isAr ? cp.titleAr : cp.titleEn}
                              </p>
                              <p className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400">{cp.code}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => redeemCoupon(selectedCustomer.id, cp.id, activeBarista.name)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                            >
                              {t('redeemCoupon')}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Program / Write Physical NFC Tag / Keyfob for this customer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      id="barista-program-nfc-tag-btn"
                      onClick={() => setShowNfcWriterModal(true)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'برمجة بطاقة / ميدالية NFC لهذا العميل' : 'Program Physical NFC Tag / Keyfob'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {t('noCustomerSelected')}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>{t('pendingApprovalsTab')}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {pendingCustomers.length} {isAr ? 'طلبات بانتظار الاعتماد' : 'pending requests'}
            </span>
          </div>

          {pendingCustomers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p>{t('noPendingApprovals')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{cust.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400 font-bold">
                        {cust.cardNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
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
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 font-bold text-xs transition"
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
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('addNewCustomer')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تسجيل عميل جديد واعتماده فورياً وإرسال رسالة ترحيب واتساب' : 'Instant in-store customer onboarding with automated WhatsApp'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAddNewCustomer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                required
                placeholder={isAr ? 'مثال: محمد الشريف' : 'e.g. Michael Jordan'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('phone')} * (WhatsApp)
              </label>
              <input
                type="tel"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                required
                placeholder="+963 933 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('dob')} 🎂
              </label>
              <input
                type="date"
                value={newCustDob}
                onChange={(e) => setNewCustDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('quickAddBtn')}</span>
            </button>
          </form>
        </div>
      )}

      {/* Live Cafe Menu & Item Lookup Tab for Barista */}
      {activeTab === 'menu' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'دليل قائمة المشروبات والمأكولات المباشر' : 'Live Cafe Menu & Product Catalog'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'بيانات حية متزامنة من Cloud Firestore لمعرفة الأسعار والمخزون' : 'Cloud Firestore synced prices, calories, and live stock availability'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? 'متصل بقاعدة البيانات' : 'Connected to Firestore'}
            </span>
          </div>

          <CustomerMenuView />
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

      {/* Program Physical NFC Tag Studio for selected customer */}
      {selectedCustomer && (
        <NfcTagWriterModal
          isOpen={showNfcWriterModal}
          onClose={() => setShowNfcWriterModal(false)}
          customer={selectedCustomer}
          onOpenQrScanner={() => setShowQrScanner(true)}
        />
      )}

      {/* Stamp Rewards Catalogue Exchange Modal */}
      {selectedCustomer && (
        <StampRewardsExchangeModal
          isOpen={showStampRewardsModal}
          onClose={() => setShowStampRewardsModal(false)}
          customer={selectedCustomer}
          baristaName={activeBarista.name}
        />
      )}
    </div>
  );
};
