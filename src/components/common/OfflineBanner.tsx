import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { t } = useApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex items-center gap-3 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-medium shadow-xl backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t('offlineMessage')}</span>
    </div>
  );
};
