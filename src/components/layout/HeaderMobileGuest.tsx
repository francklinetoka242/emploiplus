import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, MoreVertical, Briefcase } from "lucide-react";

/**
 * HeaderMobileGuest - Header for non-authenticated users
 * Shows: Logo and More Menu (Contact and About)
 */
export const HeaderMobileGuest: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo - Same as PC version */}
        <Link to="/" className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg">
            <img src="/Logo.png" alt="Logo Emploi+" />
          </div>
        </Link>

        {/* Right Actions - Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Menu"
            title="Plus d'options"
          >
            <MoreVertical className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-50">
              {/* Contact */}
              <button
                onClick={() => {
                  navigate("/contact");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
              >
                <Briefcase className="w-4 h-4" />
                Contact
              </button>

              {/* About */}
              <button
                onClick={() => {
                  navigate("/about");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                À propos
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
