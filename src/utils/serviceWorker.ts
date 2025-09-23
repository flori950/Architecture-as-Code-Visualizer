/**
 * Service Worker Registration
 * Registers the service worker for caching optimized bundles
 */

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 Registering service worker...');

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log(
        '✅ Service worker registered successfully:',
        registration.scope
      );

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available, notify user
                console.log('🔄 New content available! Refresh to update.');

                // Optional: Show update notification
                if (Notification.permission === 'granted') {
                  new Notification('App Update Available', {
                    body: 'A new version is available. Refresh to update.',
                    icon: '/favicon.svg',
                  });
                }
              } else {
                // Content cached for offline use
                console.log('📦 Content cached for offline use.');
              }
            }
          });
        }
      });

      // Check for existing service worker
      if (registration.active) {
        console.log('📱 Service worker is active and controlling pages.');
      }

      return registration;
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  } else {
    console.log('ℹ️ Service workers not supported in this browser.');
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('🗑️ Service worker unregistered');
      }
    } catch (error) {
      console.error('❌ Service worker unregistration failed:', error);
    }
  }
}

// Helper to check if app is running from cache
export function isRunningFromCache() {
  return (
    'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
  );
}

// Helper to force refresh service worker
export async function refreshServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    } else {
      await registration.update();
    }
  }
}

// Detect when app is offline/online
export function setupOfflineDetection() {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`📡 App is ${status}`);

    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent('connection-status', {
        detail: { online: navigator.onLine },
      })
    );
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial status
  updateOnlineStatus();

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
}
