import React, { useState } from 'react';
import {
  Bell,
  Coffee,
  Globe,
  Moon,
  ShieldCheck,
  Smartphone,
  Store,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    t,
    settings,
    notifications,
    toast,
    currentCustomer,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const isAr = language === 'ar';

  const roleOptions: { key: UserRole; label: string; icon: any }[] = [
    { key: 'customer', label: t('customerPortal'), icon: Smartphone },
    { key: 'barista', label: t('baristaPortal'), icon: Coffee },
    { key: 'owner', label: t('ownerPortal'), icon: Store },
  ];

  return (
    <>
      {/* Toast Notification Alert */}
      {toast && (
        <div
          id="app-toast"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xl border border-stone-700/40 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-stone-100/90 dark:bg-stone-950/90 border-b border-stone-200 dark:border-stone-850 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: settings.theme.primary || '#78350f' }}
              >
                <Coffee className="w-5 h-5 text-amber-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
                  {isAr ? settings.shopNameAr : settings.shopNameEn}
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isAr ? settings.sloganAr : settings.sloganEn}
                </p>
              </div>
            </div>

            {/* Middle: 3-Role Switcher Tabs */}
            <div className="flex items-center p-1 bg-stone-200/80 dark:bg-stone-900 rounded-xl border border-stone-300/60 dark:border-stone-800">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = role === opt.key;
                return (
                  <button
                    key={opt.key}
                    id={`role-btn-${opt.key}`}
                    onClick={() => setRole(opt.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                    <span className="hidden md:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Actions (Language, Theme, Notifications, PWA Install) */}
            <div className="flex items-center gap-2">
              <PWAInstallButton />

              {/* Language Switcher */}
              <button
                id="lang-toggle-btn"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg border border-stone-300 dark:border-stone-800 transition"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {/* Dark/Light Mode Toggle */}
              <button
                id="theme-toggle-btn"
                onClick={toggleDarkMode}
                className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition"
                title={darkMode ? t('lightMode') : t('darkMode')}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
              </button>

              {/* Notifications bell */}
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-stone-900 p-6 shadow-2xl overflow-y-auto border-l border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? 'الإشعارات والتحديثات' : 'Notifications & Updates'}
                </h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Coffee className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{isAr ? 'لا توجد إشعارات جديدة حالياً' : 'No recent broadcast notifications'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {isAr ? n.titleAr : n.titleEn}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isAr ? n.messageAr : n.messageEn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
