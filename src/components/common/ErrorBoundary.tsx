import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Coffee, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem('coffee_chunk_reload_ts');
    } catch (e) {}
    window.location.reload();
  };

  private handleResetCacheAndReload = () => {
    try {
      const keysToKeep = ['coffee_theme'];
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center p-4 text-stone-900 dark:text-stone-100 font-sans">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-5">
              <Coffee className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold mb-2">
              تحديث التطبيق مطلوب / Update Detected
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
              تم تحديث نظام نقاط وولاء المقهى بنسخة جديدة. اضغط على الزر أدناه لتحديث الشاشة فورياً ومتابعة الاستخدام.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>تحديث الشاشة الآن / Refresh App</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCacheAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                <span>إعادة ضبط الذاكرة المؤقتة / Clear Cache & Reload</span>
              </button>
            </div>

            {this.state.error && (
              <div className="mt-6 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-left text-[11px] font-mono text-stone-500 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
