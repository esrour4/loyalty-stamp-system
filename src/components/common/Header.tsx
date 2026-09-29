import React, { useState } from 'react';
import {
  Bell,
  Coffee,
  Globe,
  Moon,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  UtensilsCrossed,
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
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const isAr = language === 'ar';

  const roleOptions: { key: UserRole; label: string; icon: any }[] = [
    { key: 'landing', label: t('homePortal'), icon: Sparkles },
    { key: 'menu', label: isAr ? 'قائمة المقهى' : 'Cafe Menu', icon: UtensilsCrossed },
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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-slate-700/40 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            {/* Brand Logo & Name (Clickable to Home/Landing) */}
            <button
              type="button"
              onClick={() => setRole('landing')}
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-left rtl:text-right cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Coffee className="w-5 h-5 text-cyan-200" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-slate-50 leading-tight group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition">
                  {isAr ? settings.shopNameAr : settings.shopNameEn}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr ? settings.sloganAr : settings.sloganEn}
                </p>
              </div>
            </button>

            {/* Middle: Role & Landing Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = role === opt.key;
                return (
                  <button
                    key={opt.key}
                    id={`role-btn-${opt.key}`}
                    onClick={() => setRole(opt.key)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-cyan-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-cyan-400' : ''}`} />
                    <span className="hidden md:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Actions (PWA Install, Language, Theme, Notifications) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PWAInstallButton />

              {/* Language Switcher */}
              <button
                id="lang-toggle-btn"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px]">{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {/* Dark/Light Mode Toggle */}
              <button
                id="theme-toggle-btn"
                onClick={toggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title={darkMode ? t('lightMode') : t('darkMode')}
              >
                {darkMode ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Notifications bell */}
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 p-6 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'الإشعارات والتحديثات' : 'Notifications & Updates'}
                </h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Coffee className="w-10 h-10 mx-auto mb-2 opacity-40 text-indigo-400" />
                <p className="text-sm">{isAr ? 'لا توجد إشعارات جديدة حالياً' : 'No recent broadcast notifications'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400">
                        {isAr ? n.titleAr : n.titleEn}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
