// src/components/auth/Login.jsx - Safe Firebase Integration
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onSwitchView, onUserUpdate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Firebase login function
  const loginWithFirebase = async (email, password) => {
    try {
      // Dynamically import Firebase to prevent build errors
      const { auth } = await import('../../config/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: userCredential.user,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      return {
        success: false,
        error: error
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      
      // Try Firebase login first
      const firebaseResult = await loginWithFirebase(email, password);
      
      if (firebaseResult.success) {
        // Firebase login successful
        const userData = {
          uid: firebaseResult.uid,
          name: firebaseResult.displayName || firebaseResult.email.split('@')[0],
          email: firebaseResult.email,
          loginAt: new Date().toISOString(),
          isLoggedIn: true,
          provider: 'firebase'
        };
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        
        // Update parent component with user data
        if (onUserUpdate) {
          onUserUpdate(userData);
        }
        
        console.log('✅ Login successful with Firebase:', { 
          email: firebaseResult.email, 
          uid: firebaseResult.uid 
        });
      } else {
        // Firebase failed, handle specific errors or use localStorage fallback
        const firebaseError = firebaseResult.error;
        
        if (firebaseError?.code === 'auth/user-not-found') {
          throw new Error('No account found with this email. Please check your email or sign up.');
        } else if (firebaseError?.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please try again.');
        } else if (firebaseError?.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (firebaseError?.code === 'auth/user-disabled') {
          throw new Error('This account has been disabled. Please contact support.');
        } else if (firebaseError?.code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again later.');
        } else if (firebaseError?.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        } else if (firebaseError?.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else {
          // Fallback to localStorage if Firebase is not available
          console.warn('Firebase not available, checking localStorage for existing user');
          
          // Check if user exists in localStorage from registration
          const existingUser = localStorage.getItem('allRecipesUser');
          if (existingUser) {
            const userData = JSON.parse(existingUser);
            console.log('🔍 LOGIN DEBUG - Full localStorage data:', userData);
            console.log('🔍 LOGIN DEBUG - Email match:', userData.email === email);
            console.log('🔍 LOGIN DEBUG - Stored password:', userData.password);
            console.log('🔍 LOGIN DEBUG - Entered password:', password);
            console.log('🔍 LOGIN DEBUG - Password match:', userData.password === password);
            
            if (userData.email === email) {
              // MANDATORY password check - no exceptions
              if (!userData.password) {
                console.log('⚠️ No password stored - cannot login without password');
                throw new Error('Account setup incomplete. Please register again or contact support.');
              }
              
              // STRICT password validation
              if (userData.password !== password) {
                console.log('❌ LOGIN FAILED - Password does not match!');
                console.log('Expected password:', userData.password);
                console.log('Received password:', password);
                throw new Error('Invalid email or password. Please check your credentials.');
              }
              
              console.log('✅ LOGIN SUCCESS - Password matches!');
              
              // Update login status but preserve all existing user data
              const updatedUserData = {
                ...userData, // Keep ALL existing data including the password
                isLoggedIn: true,
                loginAt: new Date().toISOString(),
                provider: userData.provider || 'localStorage'
              };
              
              console.log('💾 Saving login session data:', updatedUserData);
              localStorage.setItem('allRecipesUser', JSON.stringify(updatedUserData));
              
              // Update parent component with user data
              if (onUserUpdate) {
                onUserUpdate(updatedUserData);
              }
              
              console.log('✅ Login completed successfully');
            } else {
              console.log('❌ Email does not match stored email');
              throw new Error('Invalid email or password. Please check your credentials.');
            }
          } else {
            console.log('❌ No user data found in localStorage');
            throw new Error('No account found. Please register first.');
          }
        }
      }
      
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome to All Recipes!</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`login-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        
        <div className="auth-links">
          {/* Use onSwitchView if available, otherwise fallback to Links */}
          {onSwitchView ? (
            <>
              <button 
                type="button"
                onClick={() => onSwitchView('forgot-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b35',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: '600',
                  position: 'relative'
                }}
              >
                Forgot Password?
              </button>
              <p style={{ margin: '1.5rem 0 0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                Don't have an account? 
                <button 
                  type="button"
                  onClick={() => onSwitchView('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b35',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: '600',
                    marginLeft: '4px'
                  }}
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <a href="#forgot" style={{ color: '#ff6b35', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </a>
              <p style={{ margin: '1.5rem 0 0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                Don't have an account? 
                <a href="#register" style={{ color: '#ff6b35', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                  Sign up
                </a>
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;