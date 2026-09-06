import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

// Automatically clean up stale Service Workers from previous builds
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    });
  }

  // Catch dynamic import errors from old chunk hashes after a new deployment
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    console.warn('[Vite Preload Error] Stale chunk detected after app update. Reloading...');
    const reloadKey = 'coffee_chunk_reload_ts';
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    // Prevent infinite reload loops: only auto-reload if last reload was > 5s ago
    if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Importing a module script failed')
    ) {
      const reloadKey = 'coffee_chunk_reload_ts';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

