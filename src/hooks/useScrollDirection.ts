import { useState, useEffect, useRef } from 'react';

/**
 * Hook pour tracker la direction du scroll
 * Retourne:
 * - isVisible: true si on scroll vers le haut, false si vers le bas
 * - scrollDirection: 'up' | 'down'
 */
export const useScrollDirection = (hideThreshold: number = 100) => {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Seulement appliquer la logique de hide si on a scrollé suffisamment
          if (currentScrollY > hideThreshold) {
            if (currentScrollY > lastScrollY.current) {
              // Scrolling down - hide
              setScrollDirection('down');
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
              // Scrolling up - show
              setScrollDirection('up');
              setIsVisible(true);
            }
          } else {
            // Toujours visible si pas assez scrollé
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideThreshold]);

  return { isVisible, scrollDirection };
};
