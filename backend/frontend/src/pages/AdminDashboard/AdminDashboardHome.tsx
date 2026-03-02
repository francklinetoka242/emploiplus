/**
 * STEP 6: Admin Dashboard Home Page
 * Landing page for admin dashboard with overview statistics
 */

import React from 'react';
import { useCurrentUser } from '../context/DashboardContext';
import { ROLE_DEFINITIONS } from '../types/dashboard.types';
import './AdminDashboardHome.css';
import DashboardCards from './DashboardCards';
import DashboardCharts from './DashboardCharts';

interface DashboardStatistic {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string; // e.g., "+5.2%" or "-2.1%"
}

export const AdminDashboardHome: React.FC = () => {
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const roleDetails = ROLE_DEFINITIONS[currentUser.role_level];

  // Cards and charts now use API-driven hooks (see DashboardCards/DashboardCharts)

  /**
   * Get recent activity items
   * TODO: Replace with real data from API
   */
  const getRecentActivity = () => {
    return [
      {
        icon: '➕',
        title: 'New user registered',
        time: '2 hours ago',
        color: 'green'
      },
      {
        icon: '📝',
        title: 'Job listing published',
        time: '5 hours ago',
        color: 'blue'
      },
      {
        icon: '💳',
        title: 'Subscription renewed',
        time: '1 day ago',
        color: 'purple'
      },
      {
        icon: '⚠️',
        title: 'Support ticket created',
        time: '1 day ago',
        color: 'orange'
      }
    ];
  };

  const activities = getRecentActivity();

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>
            Welcome back, <span className="user-name">{currentUser.first_name}</span>! 👋
          </h1>
          <p>
            You're logged in as <strong>{currentUser.role_name}</strong>
            {roleDetails && <span className="role-description"> - {roleDetails.description}</span>}
          </p>
        </div>

        {/* User Avatar */}
        <div className="welcome-avatar">
          {currentUser.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.first_name} />
          ) : (
            <span className="avatar-initials">
              {currentUser.first_name[0]}
              {currentUser.last_name[0]}
            </span>
          )}
        </div>
      </div>

      {/* Statistics Grid (API-driven) */}
      <div className="statistics-section">
        <h2>Overview</h2>
        <DashboardCards />
      </div>

      {/* Charts (30-day trends) */}
      <div>
        <DashboardCharts />
      </div>

      {/* Two Column Layout: Activity + Quick Actions */}
      <div className="dashboard-row">
        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {activities.map((activity, index) => (
              <div key={index} className={`activity-item activity-${activity.color}`}>
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Access</h2>
          <div className="quick-actions-grid">
            {currentUser.role_level === 1 && (
              <>
                <button className="quick-action-btn">
                  <span className="action-icon">➕</span>
                  <span className="action-text">Create Admin</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">👥</span>
                  <span className="action-text">Manage Admins</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📊</span>
                  <span className="action-text">View Reports</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">System Settings</span>
                </button>
              </>
            )}
            {currentUser.role_level === 2 && (
              <>
                <button className="quick-action-btn">
                  <span className="action-icon">📝</span>
                  <span className="action-text">New Listing</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📋</span>
                  <span className="action-text">My Content</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">✏️</span>
                  <span className="action-text">Draft Jobs</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📊</span>
                  <span className="action-text">Analytics</span>
                </button>
              </>
            )}
            {currentUser.role_level === 3 && (
              <>
                <button className="quick-action-btn">
                  <span className="action-icon">👤</span>
                  <span className="action-text">Browse Users</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">⏳</span>
                  <span className="action-text">Pending Approvals</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">🚫</span>
                  <span className="action-text">Flagged Accounts</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📧</span>
                  <span className="action-text">Send Message</span>
                </button>
              </>
            )}
            {currentUser.role_level === 4 && (
              <>
                <button className="quick-action-btn">
                  <span className="action-icon">📊</span>
                  <span className="action-text">Analytics</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📈</span>
                  <span className="action-text">Reports</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📥</span>
                  <span className="action-text">Export Data</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📅</span>
                  <span className="action-text">Schedule Report</span>
                </button>
              </>
            )}
            {currentUser.role_level === 5 && (
              <>
                <button className="quick-action-btn">
                  <span className="action-icon">💰</span>
                  <span className="action-text">Revenues</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📜</span>
                  <span className="action-text">Subscriptions</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">💳</span>
                  <span className="action-text">Invoices</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">🔄</span>
                  <span className="action-text">Refunds</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="banner-icon">ℹ️</div>
        <div className="banner-content">
          <h3>Need Help?</h3>
          <p>
            Check our <a href="#docs">documentation</a> or contact
            <a href="mailto:support@emploiplus.com"> support@emploiplus.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
