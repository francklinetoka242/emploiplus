import React from "react";
import { cn } from "@/lib/utils";

interface PWACardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  testId?: string;
}

/**
 * PWACard - Card component optimized for PWA with:
 * - 20px border-radius for modern app-like appearance
 * - Optimized touch interactions (min 44x44px)
 * - Glassmorphism support
 * - Responsive padding
 */
export const PWACard: React.FC<PWACardProps> = ({
  children,
  className,
  interactive = false,
  onClick,
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "rounded-[20px] bg-white p-4 sm:p-6 border border-gray-200/50",
        "transition-all duration-200",
        interactive && "hover:shadow-md hover:border-gray-300 cursor-pointer",
        interactive && "active:scale-95",
        "shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * PWACardButton - Button component within cards optimized for touch
 * Minimum 44x44px touch target
 */
interface PWACardButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  testId?: string;
}

export const PWACardButton: React.FC<PWACardButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  testId,
}) => {
  const baseClasses =
    "font-semibold transition-all duration-200 rounded-lg min-h-11 flex items-center justify-center px-4";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400",
    ghost: "text-blue-600 hover:bg-blue-50 active:bg-blue-100",
  };

  const sizes = {
    sm: "text-sm py-2",
    md: "text-base py-3",
    lg: "text-lg py-4",
  };

  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};
