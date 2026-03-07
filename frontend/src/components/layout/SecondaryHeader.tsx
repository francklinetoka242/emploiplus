import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * A minimal header for secondary pages (not in bottom navigation) that
 * displays a back arrow and sticks to the top.  The layout component
 * decides when to render it based on the current route.
 */
export const SecondaryHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center pt-[env(safe-area-inset-top)]">
      <button
        onClick={() => navigate(-1)}
        className="p-3 ml-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Retour"
        data-testid="secondary-header-back"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
    </header>
  );
};
