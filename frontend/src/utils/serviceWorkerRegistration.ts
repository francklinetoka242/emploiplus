/**
 * PWA Service Worker Registration
 * À placer dans main.tsx ou App.tsx
 */

export async function registerServiceWorker() {
  // Service Worker supporté ?
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported by this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/sw.js',
      { scope: '/' }
    );

    console.log('✅ Service Worker registered:', registration);

    // Écouter les updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // Nouvelle version disponible
          console.log('✨ New Service Worker version available');
          
          // Option: afficher une notification à l'utilisateur
          // Exemple:
          // showUpdateNotification(() => window.location.reload());
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Enregistrement du Service Worker avec gestion des updates
 * Utilisation dans App.tsx ou main.tsx:
 * 
 * useEffect(() => {
 *   registerServiceWorker();
 * }, []);
 */

/**
 * Utility: Recharger l'app et activer le nouveau Service Worker
 */
export function updateServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });

  // Recharger la page
  window.location.reload();
}

/**
 * Utility: Envoyer un message au Service Worker
 */
export function sendMessageToServiceWorker(message: Record<string, unknown>) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.controller?.postMessage(message);
}

/**
 * Utility: Vérifier si une nouvelle version est disponible
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) return false;

    await registration.update();
    
    return (
      registration.installing !== null ||
      registration.waiting !== null
    );
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

/**
 * Hook pour gérer le Service Worker (optionnel)
 * À placer dans src/hooks/useServiceWorker.ts
 */
import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const initServiceWorker = async () => {
      const reg = await registerServiceWorker();
      
      if (reg) {
        setIsRegistered(true);
        setRegistration(reg);

        // Écouter les updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      }
    };

    initServiceWorker();
  }, []);

  return {
    isRegistered,
    updateAvailable,
    registration,
    update: updateServiceWorker,
    checkForUpdates: () => checkForUpdates(),
  };
}
