/**
 * Composant ProfanityWarningModal
 * Modale d'avertissement pour contenu profane
 * Responsive, accessible avec ARIA labels et focus trap
 */

import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfanityWarningModalProps {
  isOpen: boolean;
  onModify: () => void;
  onCancel: () => void;
  triggeredWords?: string[];
  warningCount?: number;
  isTemporarilySuspended?: boolean;
  remainingTime?: number;
}

export const ProfanityWarningModal: React.FC<ProfanityWarningModalProps> = ({
  isOpen,
  onModify,
  onCancel,
  triggeredWords = [],
  warningCount = 0,
  isTemporarilySuspended = false,
  remainingTime = 0,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modifyButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap - garder le focus dans la modale
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus sur le bouton "Modifier" au ouverture
      modifyButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onCancel();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Formatage du temps restant
  const formatRemainingTime = (ms: number): string => {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  return (
    <>
      {/* Backdrop semi-transparent */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        onClick={onCancel}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modale centrée */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
        role="alertdialog"
        aria-labelledby="warning-title"
        aria-describedby="warning-description"
        aria-modal="true"
      >
        {/* En-tête avec icône d'avertissement */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6 flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <AlertTriangle
              className="w-8 h-8 text-white flex-shrink-0 mt-1"
              aria-hidden="true"
            />
            <div className="flex-1">
              <h2
                id="warning-title"
                className="text-xl font-bold text-white mb-2"
              >
                ⚠️ Contenu non autorisé détecté
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onCancel}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fermer l'avertissement"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du message */}
        <div className="px-6 py-6 space-y-4">
          {!isTemporarilySuspended ? (
            <>
              <p id="warning-description" className="text-gray-700 leading-relaxed">
                En raison du respect des règles de notre communauté professionnelle, les
                mots ou expressions insultants, discriminatoires ou inappropriés ne sont
                pas tolérés.
              </p>

              {triggeredWords && triggeredWords.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    Termes détectés :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {triggeredWords.map((word, index) => (
                      <span
                        key={index}
                        className="inline-block bg-red-200 text-red-900 px-3 py-1 rounded text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {warningCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <p className="text-sm text-orange-800">
                    <span className="font-semibold">
                      Avertissements : {warningCount}/3
                    </span>
                    <br />
                    Si vous continuez à utiliser des termes interdits, votre compte risque
                    une suspension temporaire ou permanente.
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-sm font-medium">
                Veuillez reformuler votre message pour qu'il reste respectueux et
                professionnel.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-300 rounded-md p-4">
                <p className="text-red-900 font-semibold mb-2">
                  🚫 Compte temporairement suspendu
                </p>
                <p className="text-red-800 text-sm mb-3">
                  Suite à de multiples violations des règles de la communauté, votre compte a
                  été temporairement suspendu pour publier ou commenter.
                </p>
                <p className="text-red-700 font-semibold text-sm">
                  Reprendre dans : {formatRemainingTime(remainingTime)}
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Nos modérateurs examineront la situation. Merci de respecter nos conditions
                d'utilisation.
              </p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </Button>
          {!isTemporarilySuspended && (
            <Button
              ref={modifyButtonRef}
              onClick={onModify}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              autoFocus
            >
              Modifier
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
