// src/components/AccountSettings.jsx - User Account Management
import React, { useState, useEffect } from 'react';
import './AccountSettings.css';

const AccountSettings = ({ user, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check email/password change limits
  const getChangeHistory = () => {
    const history = localStorage.getItem('changeHistory') || '{}';
    return JSON.parse(history);
  };

  const canChangeEmailOrPassword = () => {
    const history = getChangeHistory();
    const userHistory = history[user.email] || { emailChanges: [], passwordChanges: [] };
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const recentEmailChanges = userHistory.emailChanges.filter(
      date => new Date(date) > twoWeeksAgo
    ).length;
    
    const recentPasswordChanges = userHistory.passwordChanges.filter(
      date => new Date(date) > twoWeeksAgo
    ).length;

    return {
      canChangeEmail: recentEmailChanges < 3,
      canChangePassword: recentPasswordChanges < 3,
      emailChangesLeft: 3 - recentEmailChanges,
      passwordChangesLeft: 3 - recentPasswordChanges
    };
  };

  const recordChange = (type) => {
    const history = getChangeHistory();
    if (!history[user.email]) {
      history[user.email] = { emailChanges: [], passwordChanges: [] };
    }
    
    if (type === 'email') {
      history[user.email].emailChanges.push(new Date().toISOString());
    } else if (type === 'password') {
      history[user.email].passwordChanges.push(new Date().toISOString());
    }
    
    localStorage.setItem('changeHistory', JSON.stringify(history));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const changes = canChangeEmailOrPassword();
      let updatedUser = { ...user };
      let hasEmailChange = false;
      let hasPasswordChange = false;

      // Validate name change (always allowed)
      if (formData.name.trim() !== user.name) {
        if (formData.name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }
        updatedUser.name = formData.name.trim();
      }

      // Validate email change
      if (formData.email !== user.email) {
        if (!changes.canChangeEmail) {
          throw new Error(`You can only change your email 3 times per 14 days. You have made 3 changes already.`);
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address');
        }
        
        updatedUser.email = formData.email;
        hasEmailChange = true;
      }

      // Validate password change
      if (showPasswordFields && formData.newPassword) {
        if (!changes.canChangePassword) {
          throw new Error(`You can only change your password 3 times per 14 days. You have made 3 changes already.`);
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // In a real app, you'd verify the current password here
        hasPasswordChange = true;
      }

      // Record changes
      if (hasEmailChange) {
        recordChange('email');
      }
      if (hasPasswordChange) {
        recordChange('password');
      }

      // Update user data
      onUserUpdate(updatedUser);
      
      let successMessage = 'Account updated successfully!';
      if (hasEmailChange || hasPasswordChange) {
        const remaining = canChangeEmailOrPassword();
        successMessage += ` Email changes remaining: ${remaining.emailChangesLeft}, Password changes remaining: ${remaining.passwordChangesLeft}`;
      }
      
      setSuccess(successMessage);

      // Reset form
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordFields(false);

    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const changes = canChangeEmailOrPassword();

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Account Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            <small className="field-hint">You can change your name anytime</small>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
            <small className="field-hint">
              Changes remaining: {changes.emailChangesLeft}/3 (per 14 days)
            </small>
          </div>

          {/* Current Password Display */}
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-display">
              <span>{"*".repeat(12)}</span>
              <button
                type="button"
                className="change-password-btn"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>

          {/* Password Change Fields */}
          {showPasswordFields && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                />
                <small className="field-hint">
                  Changes remaining: {changes.passwordChangesLeft}/3 (per 14 days)
                </small>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`save-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;