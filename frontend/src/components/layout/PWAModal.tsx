import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

/**
 * PWAModal - Modal optimized for PWA with:
 * - Slide-up animation
 * - Full-screen on mobile
 * - Touch-friendly close button
 * - Backdrop blur (Glassmorphism)
 */
export const PWAModal: React.FC<PWAModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false,
  size = "md",
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "md:max-w-sm",
    md: "md:max-w-md",
    lg: "md:max-w-lg",
    full: "md:max-w-4xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          "md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2",
          fullScreen
            ? "inset-0 rounded-t-3xl md:rounded-2xl w-full h-full md:h-auto"
            : "bottom-0 left-0 right-0 rounded-t-3xl md:rounded-2xl w-full md:w-auto",
          isOpen ? "animate-slide-up" : "translate-y-full",
          className
        )}
        style={
          isOpen
            ? {}
            : {
                animation: "slide-down 0.3s ease-in forwards",
              }
        }
      >
        {/* Modal Content */}
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          {title && (
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center justify-between rounded-t-3xl md:rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  touch-target"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * PWABottomSheet - Bottom sheet component for mobile
 * Similar to PWAModal but optimized for bottom-up actions
 */
interface PWABottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const PWABottomSheet: React.FC<PWABottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl",
          "max-h-[85vh] overflow-y-auto",
          "transition-all duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle Bar (iOS style) */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 text-center">
              {title}
            </h3>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="border-t border-gray-200 px-4 py-4 space-y-2">
            {actions}
          </div>
        )}

        {/* Safe Area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  );
};
