/**
 * Hook personnalisé pour la détection de contenu profane
 * Inclut la gestion des récidives et le stockage local
 */

import { useState, useCallback, useEffect } from "react";
import { BANNED_WORDS } from "@/constants/bannedWords";

interface ProfanityFilterResult {
  isBlocked: boolean;
  triggeredWords: string[];
  warningCount: number;
  isTemporarilySuspended: boolean;
}

const STORAGE_KEY = "profanity_warnings";
const SUSPENSION_STORAGE_KEY = "profanity_suspension";
const WARNINGS_THRESHOLD = 3;
const SUSPENSION_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes
const WARNING_RESET_TIME = 24 * 60 * 60 * 1000; // 24 heures

interface WarningRecord {
  timestamp: number;
  triggeredWords: string[];
}

export const useProfanityFilter = () => {
  const [warningCount, setWarningCount] = useState(0);
  const [isTemporarilySuspended, setIsTemporarilySuspended] = useState(false);

  // Initialiser l'état au chargement du composant
  useEffect(() => {
    updateWarningCount();
    checkSuspensionStatus();
  }, []);

  /**
   * Fonction pour nettoyer et normaliser le texte
   * Gère les variantes basiques (espaces, symboles, accents)
   */
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[éèêë]/g, "e")
      .replace(/[àâä]/g, "a")
      .replace(/[ôö]/g, "o")
      .replace(/[ûü]/g, "u")
      .replace(/[î]/g, "i")
      .replace(/[ç]/g, "c")
      .replace(/[œ]/g, "oe")
      .replace(/[æ]/g, "ae")
      .replace(/[^a-z0-9]/g, " "); // Remplace tous les caractères spéciaux par un espace
  };

  /**
   * Détecte les mots interdits dans le texte
   */
  const detectBannedWords = (text: string): string[] => {
    const normalizedText = normalizeText(text);
    const words = normalizedText.split(/\s+/).filter((w) => w.length > 0);
    const foundWords: string[] = [];

    for (const bannedWord of BANNED_WORDS) {
      // Cherche le mot comme terme complet ou substring
      for (const word of words) {
        if (word.includes(bannedWord) || bannedWord.includes(word)) {
          if (!foundWords.includes(bannedWord)) {
            foundWords.push(bannedWord);
          }
        }
      }
    }

    return foundWords;
  };

  /**
   * Vérifie et met à jour le nombre d'avertissements
   * Nettoie les anciens avertissements (> 24h)
   */
  const updateWarningCount = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const warnings: WarningRecord[] = storedData ? JSON.parse(storedData) : [];
      const now = Date.now();

      // Filtrer les avertissements récents (< 24h)
      const recentWarnings = warnings.filter(
        (w) => now - w.timestamp < WARNING_RESET_TIME
      );

      // Mettre à jour le localStorage
      if (recentWarnings.length !== warnings.length) {
        if (recentWarnings.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recentWarnings));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      setWarningCount(recentWarnings.length);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des avertissements:", error);
    }
  };

  /**
   * Vérifie si l'utilisateur est temporairement suspendu
   */
  const checkSuspensionStatus = () => {
    try {
      const suspensionData = localStorage.getItem(SUSPENSION_STORAGE_KEY);
      if (!suspensionData) {
        setIsTemporarilySuspended(false);
        return;
      }

      const { timestamp } = JSON.parse(suspensionData);
      const now = Date.now();

      if (now - timestamp < SUSPENSION_DURATION) {
        setIsTemporarilySuspended(true);
      } else {
        localStorage.removeItem(SUSPENSION_STORAGE_KEY);
        setIsTemporarilySuspended(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de suspension:", error);
    }
  };

  /**
   * Enregistre un nouvel avertissement
   */
  const recordWarning = (triggeredWords: string[]) => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const warnings: WarningRecord[] = storedData ? JSON.parse(storedData) : [];

      const newWarning: WarningRecord = {
        timestamp: Date.now(),
        triggeredWords,
      };

      warnings.push(newWarning);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(warnings));

      setWarningCount(warnings.length);

      // Si seuil atteint, suspendre l'utilisateur
      if (warnings.length >= WARNINGS_THRESHOLD) {
        suspendUser();
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement d'un avertissement:", error);
    }
  };

  /**
   * Suspend temporairement l'utilisateur
   */
  const suspendUser = () => {
    try {
      const suspensionData = {
        timestamp: Date.now(),
        reason: "Multiple profanity violations",
      };
      localStorage.setItem(SUSPENSION_STORAGE_KEY, JSON.stringify(suspensionData));
      setIsTemporarilySuspended(true);

      // Notifier l'admin (optionnel)
      notifyAdmin(
        "Suspension de compte",
        `L'utilisateur a atteint le seuil d'avertissements pour propos offensants.`
      );
    } catch (error) {
      console.error("Erreur lors de la suspension:", error);
    }
  };

  /**
   * Notifie l'admin d'une violation grave
   */
  const notifyAdmin = async (title: string, message: string) => {
    try {
      // Appel API optionnel pour notifier les admins
      // await fetch('/api/admin/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ title, message, severity: 'high' })
      // });
      console.log(`[ADMIN NOTIFICATION] ${title}: ${message}`);
    } catch (error) {
      console.error("Erreur lors de la notification admin:", error);
    }
  };

  /**
   * Filtre le contenu et retourne le résultat
   */
  const filterContent = useCallback(
    (text: string): ProfanityFilterResult => {
      // Vérifier d'abord la suspension
      if (isTemporarilySuspended) {
        return {
          isBlocked: true,
          triggeredWords: [],
          warningCount,
          isTemporarilySuspended: true,
        };
      }

      // Détecter les mots interdits
      const triggeredWords = detectBannedWords(text);

      if (triggeredWords.length > 0) {
        recordWarning(triggeredWords);
        return {
          isBlocked: true,
          triggeredWords,
          warningCount: warningCount + 1,
          isTemporarilySuspended: false,
        };
      }

      return {
        isBlocked: false,
        triggeredWords: [],
        warningCount,
        isTemporarilySuspended: false,
      };
    },
    [warningCount, isTemporarilySuspended]
  );

  /**
   * Réinitialise les avertissements (admin uniquement)
   */
  const resetWarnings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUSPENSION_STORAGE_KEY);
    setWarningCount(0);
    setIsTemporarilySuspended(false);
  }, []);

  /**
   * Obtient le temps restant avant la fin de la suspension
   */
  const getRemainingLiftTime = (): number => {
    try {
      const suspensionData = localStorage.getItem(SUSPENSION_STORAGE_KEY);
      if (!suspensionData) return 0;

      const { timestamp } = JSON.parse(suspensionData);
      const remaining = SUSPENSION_DURATION - (Date.now() - timestamp);
      return Math.max(0, remaining);
    } catch (error) {
      console.error("Erreur lors du calcul du temps restant:", error);
      return 0;
    }
  };

  return {
    filterContent,
    warningCount,
    isTemporarilySuspended,
    resetWarnings,
    getRemainingLiftTime,
  };
};
