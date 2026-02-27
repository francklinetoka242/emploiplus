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

  return (
    <>
      {/* Mobile PWA Components - Hidden on desktop */}
      {!hideNavigation && !hideHeader && (
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

      {/* Main Content - Optimized for mobile app experience */}
      <main className={`${!hideNavigation ? 'pb-20 md:pb-0' : 'pb-0'}`}>
        {children}
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
