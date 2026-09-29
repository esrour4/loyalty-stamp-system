import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { OfflineBanner } from './components/common/OfflineBanner';
import { LandingPage } from './components/landing/LandingPage';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { CustomerTableMenuView } from './components/menu/CustomerTableMenuView';
import { BaristaPanel } from './components/barista/BaristaPanel';
import { OwnerPanel } from './components/owner/OwnerPanel';
import { CheckCircle2 } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { role, setRole, toast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Offline Connectivity Status Bar */}
      <OfflineBanner />

      {/* Primary Navigation & Control Header */}
      <Header />

      {/* Main Role-Based View Switcher */}
      <main className="flex-1 w-full pb-16">
        {role === 'landing' && <LandingPage onNavigateToLogin={(targetRole) => setRole(targetRole)} />}
        {role === 'customer' && <CustomerPortal />}
        {role === 'menu' && <CustomerTableMenuView />}
        {role === 'barista' && <BaristaPanel />}
        {role === 'owner' && <OwnerPanel />}
      </main>

      {/* Footer credits & Quick Role Status */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>© {new Date().getFullYear()} Barista Stamp & Loyalty Rewards • Instant QR/NFC Pass & 963 CRM WhatsApp Integration</p>
      </footer>

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
