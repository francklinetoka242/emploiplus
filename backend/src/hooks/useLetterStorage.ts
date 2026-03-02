import { useState, useEffect } from "react";
import { MotivationLetterData } from "@/components/MotionLetterEditorModal";

const LETTERS_STORAGE_KEY = "user_motivation_letters";

export const useLetterStorage = () => {
  const [letters, setLetters] = useState<MotivationLetterData[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LETTERS_STORAGE_KEY);
    if (stored) {
      try {
        setLetters(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading letters:", error);
      }
    }
  }, []);

  // Save to localStorage whenever letters change
  useEffect(() => {
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(letters));
  }, [letters]);

  const addLetter = (letter: MotivationLetterData) => {
    setLetters((prev) => [...prev, letter]);
  };

  const updateLetter = (id: string, updates: Partial<MotivationLetterData>) => {
    setLetters((prev) =>
      prev.map((letter) =>
        letter.id === id ? { ...letter, ...updates } : letter
      )
    );
  };

  const deleteLetter = (id: string) => {
    setLetters((prev) => prev.filter((letter) => letter.id !== id));
  };

  const getLetter = (id: string) => {
    return letters.find((letter) => letter.id === id);
  };

  const getLettersByTemplate = (templateId: string) => {
    return letters.filter((letter) => letter.template === templateId);
  };

  return {
    letters,
    addLetter,
    updateLetter,
    deleteLetter,
    getLetter,
    getLettersByTemplate,
  };
};
