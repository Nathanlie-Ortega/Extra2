// src/components/auth/Register.jsx - Simple Working Version
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ onSwitchView, onUserUpdate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 6 characters long';
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return 'Password must contain uppercase, lowercase, and numbers';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Simple validation
      if (!name || !email || !password) {
        throw new Error('Please fill in all fields');
      }
      
      console.log('🎯 Registration attempt:', { name, email });
      
      // Try Firebase registration
      try {
        console.log('📦 Importing Firebase...');
        const { auth } = await import('../../config/firebase');
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        
        console.log('✅ Firebase modules imported');
        console.log('📧 Creating user...');
        
        // Create user with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        console.log('✅ User created:', userCredential.user.uid);
        
        // Update user profile
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        console.log('✅ Profile updated');
        
        // Store user data with the correct name
        const userData = {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          password: password, // Store initial password
          registeredAt: new Date().toISOString(),
          isLoggedIn: true,
          provider: 'firebase'
        };
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        
        // Update parent component with new user data
        if (onUserUpdate) {
          onUserUpdate(userData);
        }
        
        console.log('🎉 Registration successful! Check Firebase Console!');
        navigate('/');
        
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        
        // Handle specific Firebase errors
        if (firebaseError.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please use a different email.');
        } else if (firebaseError.code === 'auth/weak-password') {
          throw new Error('Password is too weak. Please choose a stronger password.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else {
          // Fallback to localStorage if Firebase is not available
          console.warn('Firebase not available, using localStorage fallback');
          const userData = {
            name: name,
            email: email,
            password: password, // Store initial password
            registeredAt: new Date().toISOString(),
            isLoggedIn: true,
            provider: 'localStorage'
          };
          localStorage.setItem('allRecipesUser', JSON.stringify(userData));
          
          // Update parent component with new user data
          if (onUserUpdate) {
            onUserUpdate(userData);
          }
          
          console.log('✅ Registration successful with localStorage fallback:', { name, email });
          navigate('/');
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create account');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* NAME FIELD - FIRST */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ 
              width: '100%',
              padding: '1.2rem 1rem',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        {/* EMAIL FIELD - SECOND */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {/* PASSWORD FIELD - THIRD */}
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
        
        {/* CONFIRM PASSWORD FIELD - FOURTH */}
        <div className="form-group">
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? "🙉" : "👁️"}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`register-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        
        <div className="auth-links">
          {onSwitchView ? (
            <p style={{ margin: '1.5rem 0 0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
              Already have an account? 
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
                  marginLeft: '4px'
                }}
              >
                Log in
              </button>
            </p>
          ) : (
            <p style={{ margin: '1.5rem 0 0.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
              Already have an account? 
              <a href="#login" style={{ color: '#ff6b35', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                Log in
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Register;