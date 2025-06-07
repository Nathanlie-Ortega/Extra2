// src/components/Header.jsx - Safe Firebase Integration
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { GiSpoon } from 'react-icons/gi';
import { BiSolidUserCircle } from 'react-icons/bi';
import UserSidebar from './UserSidebar';

const Header = () => {
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Firebase auth state listener
  const setupFirebaseListener = async () => {
    try {
      const { auth } = await import('../config/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      
      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in with Firebase
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            isLoggedIn: true,
            provider: 'firebase'
          };
          setUser(userData);
          localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        } else {
          // Check localStorage for fallback
          checkLocalStorageUser();
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('Firebase not available, using localStorage only');
      checkLocalStorageUser();
      setLoading(false);
      return null;
    }
  };

  // Check localStorage for user data
  const checkLocalStorageUser = () => {
    try {
      const userData = localStorage.getItem('allRecipesUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isLoggedIn) {
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('allRecipesUser');
      setUser(null);
    }
  };

  useEffect(() => {
    let unsubscribe = null;

    // Try to setup Firebase listener
    setupFirebaseListener().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleAuthClick = () => {
    if (user) {
      setShowSidebar(true);
    } else {
      console.log('🔐 Navigating to login page...');
      
      // If already on login page, force refresh to go back to login view
      if (location.pathname === '/login') {
        window.location.href = '/login';
      } else {
        navigate('/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Try Firebase logout first
      try {
        const { auth } = await import('../config/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        console.log('✅ User logged out from Firebase');
      } catch (firebaseError) {
        console.warn('Firebase logout failed, using localStorage cleanup');
      }
      
      // Always clear localStorage and local state
      setUser(null);
      setShowSidebar(false);
      localStorage.removeItem('allRecipesUser');
      navigate('/login');
      console.log('✅ User logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('allRecipesUser', JSON.stringify(updatedUser));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Show loading state briefly
  if (loading) {
    return (
      <div className="header-container">
        <Link to={'/'}>
          <h1>
            All Recipes
            <GiSpoon />
          </h1>
        </Link>
        <BiSolidUserCircle 
          className='user-img' 
          style={{ opacity: 0.5 }}
          title="Loading..."
        />
      </div>
    );
  }

  return (
    <>
      <div className="header-container">
        <Link to={'/'}>
          <h1>
            All Recipes
            <GiSpoon />
          </h1>
        </Link>
        
        {user ? (
          // Show user avatar when logged in
          <div 
            className="user-avatar-header"
            onClick={handleAuthClick}
            title={`${user.name || user.email} - Click for account`}
            style={{ 
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 10px rgba(255, 107, 53, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {getInitials(user.name || user.email)}
          </div>
        ) : (
          // Show login icon when not logged in
          <BiSolidUserCircle 
            className='user-img' 
            onClick={handleAuthClick}
            title="Login / Register"
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>

      {showSidebar && user && (
        <UserSidebar 
          user={user}
          onClose={() => setShowSidebar(false)}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </>
  );
};

export default Header;