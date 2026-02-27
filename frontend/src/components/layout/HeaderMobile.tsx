import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  notificationCount?: number;
  onDrawerOpen?: () => void;
  onSearchOpen?: () => void;
}

export const HeaderMobile: React.FC<HeaderProps> = ({
  notificationCount = 0,
  onDrawerOpen,
  onSearchOpen,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const handleSearchClick = () => {
    if (onSearchOpen) {
      onSearchOpen();
    } else {
      setShowSearchMobile(!showSearchMobile);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      {/* Simplified Header for Authenticated Users */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo - Just the icon "E+" */}
        <Link to={user ? "/newsfeed" : "/"} className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">+</span>
          </div>
        </Link>

        {/* Right Actions - Search and Notifications */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={handleSearchClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Rechercher"
            data-testid="header-search"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button>

          {/* Notifications Bell */}
          {user && (
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
              data-testid="header-notifications"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search Bar - Mobile (Expandable) */}
      {showSearchMobile && (
        <div className="px-4 py-2 border-t border-gray-100 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all"
              autoFocus
              onBlur={() => setShowSearchMobile(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
