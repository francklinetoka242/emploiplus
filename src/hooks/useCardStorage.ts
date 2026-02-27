import { useCallback } from 'react';

export interface BusinessCardData {
  id: string;
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  template: string;
  createdAt: string;
}

const STORAGE_KEY = 'user_business_cards';

export const useCardStorage = (onUpdate?: () => void) => {
  const getCards = useCallback((): BusinessCardData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, []);

  const addCard = useCallback(
    (card: Omit<BusinessCardData, 'id' | 'createdAt'>) => {
      const cards = getCards();
      const newCard: BusinessCardData = {
        ...card,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      cards.push(newCard);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      onUpdate?.();
      return newCard;
    },
    [getCards, onUpdate]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<BusinessCardData>) => {
      const cards = getCards();
      const index = cards.findIndex(c => c.id === id);
      if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        onUpdate?.();
      }
    },
    [getCards, onUpdate]
  );

  const deleteCard = useCallback(
    (id: string) => {
      const cards = getCards().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      onUpdate?.();
    },
    [getCards, onUpdate]
  );

  const getCard = useCallback(
    (id: string) => {
      return getCards().find(c => c.id === id);
    },
    [getCards]
  );

  const getCardsByTemplate = useCallback(
    (template: string) => {
      return getCards().filter(c => c.template === template);
    },
    [getCards]
  );

  return {
    getCards,
    addCard,
    updateCard,
    deleteCard,
    getCard,
    getCardsByTemplate,
  };
};
