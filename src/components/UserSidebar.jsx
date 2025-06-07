// src/components/UserSidebar.jsx - Account Management
import React, { useState } from 'react';
import AccountSettings from './AccountSettings';
import './UserSidebar.css';

const UserSidebar = ({ user, onClose, onLogout, onUserUpdate }) => {
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleAccountSettings = () => {
    setShowAccountSettings(true);
  };

  const handleCloseSettings = () => {
    setShowAccountSettings(false);
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Close sidebar when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar Overlay */}
      <div className="sidebar-overlay" onClick={handleOverlayClick}>
        <div className="user-sidebar">
          {/* Close Button */}
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>

          {/* User Profile Section */}
          <div className="user-profile">
            <div className="user-avatar-large">
              <span className="user-initials-large">
                {getInitials(user.name || user.email)}
              </span>
            </div>
            <div className="user-info">
              <h3 className="user-name">
                {user.name || user.email.split('@')[0]}
              </h3>
              <p className="user-email">{user.email}</p>
            </div>
          </div>

          {/* Menu Options */}
          <div className="sidebar-menu">
            <button 
              className="menu-item"
              onClick={handleAccountSettings}
            >
              <span className="menu-icon">⚙️</span>
              Account Settings
              <span className="menu-arrow">→</span>
            </button>

            <button 
              className="menu-item logout-item"
              onClick={handleLogoutClick}
            >
              <span className="menu-icon">🚪</span>
              Logout
              <span className="menu-arrow">→</span>
            </button>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <p>All Recipes © 2025</p>
          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings 
          user={user}
          onClose={handleCloseSettings}
          onUserUpdate={onUserUpdate}
        />
      )}
    </>
  );
};

export default UserSidebar;