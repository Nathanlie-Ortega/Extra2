// src/components/AccountSettings.jsx
import React, { useState } from 'react';
import './AccountSettings.css';

const AccountSettings = ({ user, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '', // Email will be read-only
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleInputChange = (e) => {
    // Only allow name changes, email is read-only
    if (e.target.name === 'name') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
      setError('');
      setSuccess('');
    }
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      const { auth } = await import('../config/firebase');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      // Set a flag that password reset is pending
      localStorage.setItem('passwordResetPending', 'true');
      localStorage.setItem('passwordResetInitiated', Date.now().toString());
      
      await sendPasswordResetEmail(auth, user.email);
      setSuccess(`Password reset email sent to ${user.email}. Check your inbox and follow the instructions.`);
      console.log('✅ Password reset email sent successfully');
      console.log('🏃 Password reset monitoring started');
      
      // Start immediate monitoring for when user returns
      setTimeout(() => {
        // Force logout after 30 seconds to be safe
        if (localStorage.getItem('passwordResetPending')) {
          window.location.href = '/login';  // Force redirect to login
        }
      }, 30000);
      
    } catch (firebaseError) {
      // Remove the pending flag if email send failed
      localStorage.removeItem('passwordResetPending');
      localStorage.removeItem('passwordResetInitiated');
      
      console.error('❌ Password reset failed:', firebaseError);
      
      // Handle common Firebase errors
      if (firebaseError.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many password reset requests. Please wait before trying again.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to send password reset email. Please try again or contact support.');
      }
    }

    setResetLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let updatedUser = { ...user };
      let hasNameChange = false;

      // Validate name change (always allowed)
      if (formData.name.trim() !== user.name) {
        if (formData.name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }
        updatedUser.name = formData.name.trim();
        hasNameChange = true;
      }

      // Only proceed if there are actual changes
      if (!hasNameChange) {
        setError('No changes to save.');
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem('allRecipesUser', JSON.stringify(updatedUser));

      // Try to update Firebase if available
      try {
        if (user.provider === 'firebase') {
          const { auth } = await import('../config/firebase');
          const { updateProfile } = await import('firebase/auth');
          
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: updatedUser.name
            });
            console.log('✅ Firebase profile updated');
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase update failed, but localStorage updated:', firebaseError);
      }

      // Update parent component
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      setSuccess('Name updated successfully!');

    } catch (error) {
      console.error('❌ Account update error:', error);
      setError(error.message);
    }

    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

          {/* Email Field - Read Only */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              disabled
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                cursor: 'not-allowed',
                opacity: 0.7
              }}
            />
            <small className="field-hint">Email cannot be changed</small>
          </div>

          {/* Password Reset Section */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-display">
              <span>{"*".repeat(12)}</span>
              <button
                type="button"
                className={`change-password-btn ${resetLoading ? 'loading' : ''}`}
                onClick={handlePasswordReset}
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
            <small className="field-hint">
              Click "Reset Password" to receive an email with instructions to change your password
            </small>
          </div>

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