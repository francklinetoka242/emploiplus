/**
 * usePWA Hook
 * Gère les états et fonctionnalités spécifiques à la PWA
 * - Installation prompt
 * - Notifications
 * - Offline status
 * - Screen orientation
 */

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;  
}

export interface PWAConfig {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: () => Promise<void>;
  dismissInstallPrompt: () => void;
  isDarkMode: boolean;
  screenWidth: number;
  isMobile: boolean;
}

export function usePWA(): PWAConfig {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Détection de l'installation
  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();
  }, []);

  // Gestion du prompt d'installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Détection de la connexion
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

  // Détection du mode sombre
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showInstallPrompt = useCallback(async () => {
    if (!installPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }, [installPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setCanInstall(false);
  }, []);

  return {
    canInstall,
    isInstalled,
    isOnline,
    showInstallPrompt,
    dismissInstallPrompt,
    isDarkMode,
    screenWidth,
    isMobile: screenWidth < 768, // md breakpoint
  };
}

/**
 * useInstallPWA Hook
 * Version simplifiée pour juste l'installation
 */
export function useInstallPWA() {
  const { canInstall, isInstalled, showInstallPrompt, dismissInstallPrompt } = usePWA();

  return {
    canInstall,
    isInstalled,
    install: showInstallPrompt,
    dismiss: dismissInstallPrompt,
  };
}

/**
 * useOfflineStatus Hook
 * Détecte si l'app est offline
 */
export function useOfflineStatus() {
  const { isOnline } = usePWA();
  return isOnline;
}

/**
 * useResponsiveScreen Hook
 * Donne des infos sur la taille d'écran
 */
export function useResponsiveScreen() {
  const { screenWidth, isMobile } = usePWA();
  
  return {
    screenWidth,
    isMobile,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    isSmallMobile: screenWidth < 375,
  };
}
