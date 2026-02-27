/**
 * STEP 6: Admin Header Component
 * Top bar with user info, role, avatar, and logout button
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { ICON_MAP, ROLE_DEFINITIONS } from '../types/dashboard.types';
import './AdminHeader.css';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarCollapsed, onSidebarToggle }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useDashboard();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) {
    return null;
  }

  /**
   * Get initials from name
   */
  const getInitials = (): string => {
    return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
  };

  /**
   * Get role details
   */
  const roleDetails = ROLE_DEFINITIONS[currentUser.role_level];

  /**
   * Handle navigation to profile
   */
  const handleProfileClick = () => {
    navigate('/admin/profile');
    setShowUserMenu(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="admin-header">
      {/* Left Section: Sidebar Toggle + Logo */}
      <div className="header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onSidebarToggle}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? '≡' : '☰'}
        </button>
        
        <div className="header-logo">
          <span className="logo-icon">👔</span>
          <span className="logo-text">Admin Dashboard</span>
        </div>
      </div>

      {/* Right Section: User Info & Logout */}
      <div className="header-right">
        {/* Current Time (Optional) */}
        <div className="header-time">
          <span id="current-time" title="Current time">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Divider */}
        <div className="header-divider" />

        {/* User Info & Dropdown */}
        <div className="user-menu-container">
          {/* Avatar & Name Button */}
          <button
            className="user-info-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Toggle user menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div className="avatar-large">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.first_name}
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials">{getInitials()}</span>
              )}
            </div>

            {/* User Name & Role */}
            <div className="user-details">
              <div className="user-name">
                {currentUser.first_name} {currentUser.last_name}
              </div>
              <div className="user-role">
                <span
                  className={`role-badge role-${currentUser.role_level}`}
                  style={{ '--role-color': roleDetails.color } as any}
                >
                  {currentUser.role_name}
                </span>
              </div>
            </div>

            {/* Dropdown Arrow */}
            <span className="dropdown-arrow">▼</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="user-dropdown-menu" role="menu">
              {/* User Info Section */}
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.first_name} />
                  ) : (
                    <span className="avatar-initials">{getInitials()}</span>
                  )}
                </div>
                <div className="dropdown-user-text">
                  <div className="dropdown-name">
                    {currentUser.first_name} {currentUser.last_name}
                  </div>
                  <div className="dropdown-email">{currentUser.email}</div>
                  <div className="dropdown-role">{roleDetails.description}</div>
                </div>
              </div>

              {/* Divider */}
              <div className="dropdown-divider" />

              {/* Menu Items */}
              <ul className="dropdown-menu-items">
                {/* Profile */}
                <li>
                  <button
                    className="dropdown-item"
                    onClick={handleProfileClick}
                    role="menuitem"
                  >
                    <span className="dropdown-icon">{ICON_MAP['profile']}</span>
                    <span>Mon Profil</span>
                  </button>
                </li>

                {/* Settings */}
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowUserMenu(false);
                    }}
                    role="menuitem"
                  >
                    <span className="dropdown-icon">{ICON_MAP['settings']}</span>
                    <span>Paramètres</span>
                  </button>
                </li>
              </ul>

              {/* Divider */}
              <div className="dropdown-divider" />

              {/* Logout Button */}
              <button
                className="dropdown-logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <span className="dropdown-icon">{ICON_MAP['logout']}</span>
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="user-menu-backdrop"
          onClick={() => setShowUserMenu(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default AdminHeader;
