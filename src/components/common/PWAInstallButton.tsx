import React, { useState } from 'react';
import { Download, Share, Smartphone, Monitor, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const { language } = useApp();
  const isAr = language === 'ar';

  // If running in standalone mode (already installed), hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 dark:from-amber-500 dark:to-amber-400 dark:text-slate-950 rounded-xl shadow-sm transition active:scale-95 cursor-pointer shrink-0"
        title={isAr ? 'تثبيت التطبيق على جهازك' : 'Install PWA App'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">{isAr ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>

      {/* Install Guidance Modal (for iOS, Android, or desktop) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isAr ? 'تثبيت التطبيق على جهازك' : 'Install App on Your Device'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'وصول فوري وسريع لبطاقة الأختام بدون متجر' : 'Instant home screen access & offline pass'}
                </p>
              </div>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <p className="leading-relaxed">
                      {isAr ? (
                        <>
                          اضغط على زر <strong>المشاركة (Share)</strong> <Share className="inline w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 mx-0.5" /> أسفل متصفح سفاري (Safari).
                        </>
                      ) : (
                        <>
                          Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 mx-0.5" /> at the bottom of Safari.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <p className="leading-relaxed">
                      {isAr ? (
                        <>
                          مرر للأسفل واختر <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.
                        </>
                      ) : (
                        <>
                          Scroll down and tap <strong>Add to Home Screen</strong>.
                        </>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <p className="leading-relaxed">
                      {isAr ? (
                        <>
                          اضغط على قائمة المتصفح <strong>(ثلاث نقاط ⋮)</strong> في الزاوية العلوية.
                        </>
                      ) : (
                        <>
                          Tap browser menu <strong>(three dots ⋮)</strong> in the top or bottom bar.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <p className="leading-relaxed">
                      {isAr ? (
                        <>
                          اختر <strong>تثبيت التطبيق (Install App)</strong> أو <strong>إضافة إلى الشاشة الرئيسية (Add to Home screen)</strong>.
                        </>
                      ) : (
                        <>
                          Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium">
                  {isAr ? 'يعمل بدون إنترنت وبشكل مستقل مثل تطبيق أصلي!' : 'Works offline & opens in standalone app mode!'}
                </span>
              </div>
            </div>

            {/* Direct Trigger button if available */}
            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  await install();
                  setShowGuide(false);
                }}
                className="w-full py-3 mb-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تثبيت الآن فورياً' : 'Install Directly Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
