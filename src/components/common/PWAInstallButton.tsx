import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useApp();
  const isAr = language === 'ar';

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isAr ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isAr ? 'تثبيت على الآيفون' : 'Add to iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {isAr ? 'تثبيت على iPhone و iPad' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isAr ? 'بطاقة الولاء على شاشتك الرئيسية' : 'Quick access from home screen'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-stone-600 dark:text-stone-300 mb-5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    {isAr ? (
                      <>
                        اضغط على أيقونة <strong>المشاركة (Share)</strong> <Share className="inline w-3.5 h-3.5" /> في شريط سفاري.
                      </>
                    ) : (
                      <>
                        Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5" /> in Safari.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    {isAr ? (
                      <>
                        مرر للأسفل واضغط على <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.
                      </>
                    ) : (
                      <>
                        Scroll down and tap <strong>Add to Home Screen</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-semibold hover:opacity-90 transition"
              >
                {isAr ? 'حسناً، فهمت' : 'Got it!'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
