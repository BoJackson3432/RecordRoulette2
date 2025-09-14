// PWA utilities for RecordRoulette
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
  
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  
  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async initialize() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version found');
        });
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Install prompt available');
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });

    // Check if running as PWA
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User installed PWA');
        return true;
      } else {
        console.log('User dismissed install');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  isRunningAsPWA(): boolean {
    return this.isInstalled;
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(
          // Replace with your VAPID public key
          'BJ5xZ4A4Zm1_-HCFLZdGrb_h3_4uq-RXs3_8zG_YQKHwN_xB3cg4PdJJZeChR_QkYlFQbX-HFKgJTJr7XbX6UmE'
        )
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Offline functionality
  async cacheEssentialData() {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('essential-data');
      
      // Cache user's recent spins for offline viewing
      const response = await fetch('/api/profile/spins?limit=10');
      if (response.ok) {
        await cache.put('/api/profile/spins?limit=10', response.clone());
      }
    } catch (error) {
      console.error('Failed to cache essential data:', error);
    }
  }

  // Analytics for PWA usage
  trackPWAUsage() {
    if (this.isRunningAsPWA()) {
      this.trackEvent('pwa_session_start');
    }
  }

  private trackEvent(event: string, properties: Record<string, any> = {}) {
    // Track PWA-specific events for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event, {
        ...properties,
        is_pwa: this.isRunningAsPWA(),
        can_install: this.canInstall()
      });
    }
    
    // Also track with console for development
    console.log(`[PWA] ${event}`, properties);
  }
}

export const pwa = PWAManager.getInstance();