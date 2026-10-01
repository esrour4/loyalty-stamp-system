import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useApp();
  const isAr = language === 'ar';

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-xl border border-amber-400/40 backdrop-blur-md animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
      <span>{isAr ? 'وضع عدم الاتصال — يتم استخدام البيانات المحفوظة محلياً' : 'Offline Mode — Using cached local data'}</span>
    </div>
  );
};
