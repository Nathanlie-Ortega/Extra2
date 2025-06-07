// src/components/auth/ForgotPassword.jsx - Safe Firebase Integration
import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Firebase password reset function
  const resetPasswordWithFirebase = async (email) => {
    try {
      // Dynamically import Firebase to prevent build errors
      const { auth } = await import('../../config/firebase');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Firebase password reset error:', error);
      return {
        success: false,
        error: error
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Simple validation
      if (!email) {
        throw new Error('Please enter your email address');
      }
      
      // Try Firebase password reset first
      const firebaseResult = await resetPasswordWithFirebase(email);
      
      if (firebaseResult.success) {
        // Firebase password reset successful
        console.log('✅ Password reset email sent via Firebase to:', email);
        setMessage('Check your inbox! We sent you a password reset link.');
      } else {
        // Firebase failed, handle specific errors or use fallback
        const firebaseError = firebaseResult.error;
        
        if (firebaseError?.code === 'auth/user-not-found') {
          throw new Error('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (firebaseError?.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (firebaseError?.code === 'auth/too-many-requests') {
          throw new Error('Too many password reset requests. Please try again later.');
        } else if (firebaseError?.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          // Fallback message if Firebase is not available
          console.warn('Firebase not available, showing fallback message');
          setMessage('Check your inbox for password reset instructions (Note: Firebase not configured)');
        }
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please check your email address.');
    }
    
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="forgot-password-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className={`reset-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
        
        <div className="auth-links">
          {/* Use onSwitchView if available, otherwise fallback to Link */}
          {onSwitchView ? (
            <button 
              type="button"
              onClick={() => onSwitchView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6b35',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
               Back to Login
            </button>
          ) : (
            <a href="#login" style={{ color: '#ff6b35', textDecoration: 'none', fontWeight: '600' }}>
               Back to Login
            </a>
          )}
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;