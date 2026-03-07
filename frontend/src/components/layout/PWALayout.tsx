import React, { useState } from "react";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { BottomNavigationGuest } from "./BottomNavigationGuest";
import { HeaderMobile } from "./HeaderMobile";
import { HeaderMobileGuest } from "./HeaderMobileGuest";
import { Drawer } from "./Drawer";
import { useAuth } from "@/hooks/useAuth";

interface PWALayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
  messageCount?: number;
  hideNavigation?: boolean; // Hide header and bottom nav on mobile (for auth pages)
  hideHeader?: boolean; // Hide only header on mobile (for pages with search bar)
}

/**
 * PWALayout - Main layout component for PWA
 * Responsive layout:
 * - Mobile: Shows HeaderMobile/HeaderMobileGuest + BottomNavigationBar/BottomNavigationGuest
 * - Desktop: Only shows children
 * - hideNavigation: Set to true for auth pages (Login/Register) to show clean mobile UI
 * - hideHeader: Set to true for pages with search bars that replace the header
 */
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SecondaryHeader } from "./SecondaryHeader";

export const PWALayout: React.FC<PWALayoutProps> = ({
  children,
  notificationCount = 0,
  messageCount = 0,
  hideNavigation = false,
  hideHeader = false,
}) => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAuthenticated = !!user;
  const location = useLocation();

  // bottom navigation routes - include only top level paths that appear
  // directly in the nav.  pages built on top of these (e.g. /emplois/123)
  // are considered *secondary* and will trigger the back header.
  const mainNavPaths = [
    "/", // guest/home
    "/connexions",
    "/emplois",
    "/newsfeed",
    "/messages",
    "/profil",
    "/recrutement",
    "/candidats",
    "/settings",
    "/connexion",
    "/inscription",
  ];

  const isMainPage = mainNavPaths.some((p) => location.pathname === p);
  const showSecondaryHeader = !hideNavigation && !isMainPage;

  return (
    <>
      {/* Mobile PWA Components - Hidden on desktop */}
      {!hideNavigation && !hideHeader && !showSecondaryHeader && (
        <div className="md:hidden">
          {/* Header - Different for authenticated vs guest users */}
          {isAuthenticated ? (
            <HeaderMobile
              notificationCount={notificationCount}
              onDrawerOpen={() => setIsDrawerOpen(true)}
            />
          ) : (
            <HeaderMobileGuest />
          )}
        </div>
      )}

      {/* Secondary header for sub-pages */}
      {showSecondaryHeader && (
        <div className="md:hidden">
          <SecondaryHeader />
        </div>
      )}

      {/* Main Content - Optimized for mobile app experience */}
      <main
        className={`${
          !hideNavigation ?
            'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0' :
            'pb-0'
        } ${showSecondaryHeader ? 'pt-14' : ''}`}
      >
        {/* Animate page transitions for a native-feel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile only */}
      {!hideNavigation && (
        <div className="md:hidden">
          {isAuthenticated ? (
            <BottomNavigationBar
              notificationCount={notificationCount}
              messageCount={messageCount}
            />
          ) : (
            <BottomNavigationGuest />
          )}
        </div>
      )}

      {/* Drawer - Mobile only, only for authenticated users */}
      {isAuthenticated && (
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      )}
    </>
  );
};
