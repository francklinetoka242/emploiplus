/**
 * STEP 6: Sidebar Component
 * Collapsible side menu with role-based item visibility
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarMenuItem, SIDEBAR_MENU_TEMPLATE, ICON_MAP } from '../types/dashboard.types';
import { useDashboard } from '../context/DashboardContext';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useDashboard();
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);

  /**
   * Filter menu items based on user role
   */
  useEffect(() => {
    if (!currentUser) return;

    const filteredItems = SIDEBAR_MENU_TEMPLATE.map(item => ({
      ...item,
      isActive: location.pathname === item.path,
      children: item.children?.filter(child =>
        child.roles.includes(currentUser.role_level)
      )
    })).filter(item => item.roles.includes(currentUser.role_level));

    setMenuItems(filteredItems);
  }, [currentUser, location]);

  /**
   * Handle menu item click
   */
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  /**
   * Get icon for menu item
   */
  const getIcon = (iconName: string): string => {
    return ICON_MAP[iconName as keyof typeof ICON_MAP] || '•';
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <span className="logo-icon">👔</span>
            <span className="logo-text">EmploiPlus</span>
          </div>
        )}
        <button
          className="toggle-btn"
          onClick={onToggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <span>{ICON_MAP['arrow-right']}</span>
          ) : (
            <span>{ICON_MAP['arrow-left']}</span>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Menu Items */}
      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <div key={item.id} className="sidebar-item-group">
            {/* Main Menu Item */}
            <button
              className={`sidebar-item ${item.isActive ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
              title={isCollapsed ? item.label : undefined}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <span className="sidebar-icon">
                {getIcon(item.icon)}
              </span>

              {/* Text Label (visible when expanded) */}
              {!isCollapsed && (
                <>
                  <span className="sidebar-label">{item.label}</span>

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </>
              )}

              {/* Collapsed Badge */}
              {isCollapsed && item.badge && item.badge > 0 && (
                <span className="sidebar-badge-small">{item.badge > 9 ? '9+' : item.badge}</span>
              )}
            </button>

            {/* Submenu Items (only when expanded) */}
            {!isCollapsed && item.children && item.children.length > 0 && (
              <div className="sidebar-submenu">
                {item.children.map(child => (
                  <button
                    key={child.id}
                    className={`sidebar-subitem ${child.isActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(child.path)}
                    aria-current={child.isActive ? 'page' : undefined}
                  >
                    <span className="sidebar-icon">{getIcon(child.icon)}</span>
                    <span className="sidebar-label">{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Bottom Menu Items */}
      <nav className="sidebar-bottom">
        {/* Settings */}
        <button
          className={`sidebar-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}
          onClick={() => handleMenuClick('/admin/settings')}
          title={isCollapsed ? 'Settings' : undefined}
          aria-current={location.pathname === '/admin/settings' ? 'page' : undefined}
        >
          <span className="sidebar-icon">{ICON_MAP['settings']}</span>
          {!isCollapsed && <span className="sidebar-label">Paramètres</span>}
        </button>

        {/* Profile */}
        <button
          className={`sidebar-item ${location.pathname === '/admin/profile' ? 'active' : ''}`}
          onClick={() => handleMenuClick('/admin/profile')}
          title={isCollapsed ? 'Profile' : undefined}
          aria-current={location.pathname === '/admin/profile' ? 'page' : undefined}
        >
          <span className="sidebar-icon">{ICON_MAP['profile']}</span>
          {!isCollapsed && <span className="sidebar-label">Profil</span>}
        </button>
      </nav>

      {/* Sidebar Footer Info (when expanded) */}
      {!isCollapsed && currentUser && (
        <div className="sidebar-footer">
          <div className="user-info-compact">
            <div className="avatar-small">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.first_name} />
              ) : (
                <span className="initials">
                  {currentUser.first_name[0]}
                  {currentUser.last_name[0]}
                </span>
              )}
            </div>
            <div className="user-text">
              <div className="user-name">
                {currentUser.first_name} {currentUser.last_name}
              </div>
              <div className="user-role">{currentUser.role_name}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
