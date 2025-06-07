// src/pages/AuthPage.jsx - Fixed Navigation
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ForgotPassword from '../components/auth/ForgotPassword';
import './AuthPage.css';

const AuthPage = () => {
  // State to track which form to show
  const [currentView, setCurrentView] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle browser back button to go back to login instead of home
  useEffect(() => {
    const handlePopState = (event) => {
      if (currentView !== 'login') {
        // If not on login view, go to login instead of home
        event.preventDefault();
        setCurrentView('login');
        window.history.pushState(null, '', '/login');
      }
    };

    // Push current state to prevent immediate back navigation
    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView, location.pathname]);

  const renderAuthForm = () => {
    switch (currentView) {
      case 'register':
        return <Register onSwitchView={setCurrentView} />;
      case 'forgot-password':
        return <ForgotPassword onSwitchView={setCurrentView} />;
      default:
        return <Login onSwitchView={setCurrentView} />;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>All Recipes Web App</h1>
          <p>Your culinary journey starts here</p>
          <div className="brand-features">
            <div className="brand-feature">
              <span>🍳</span>
              Discover Amazing Recipes
            </div>
            <div className="brand-feature">
              <span>📱</span>
              Save Your Favorites
            </div>
            <div className="brand-feature">
              <span>👥</span>
              Share with Friends
            </div>
          </div>
        </div>
        <div className="auth-content">
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;