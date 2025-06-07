// src/hooks/useAuth.js - Updated Hook
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase auth state listener
  const setupFirebaseListener = async () => {
    try {
      const { auth } = await import('../config/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      
      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in with Firebase
          // Check if we have updated user data in localStorage first
          const localUser = getLocalStorageUser();
          if (localUser && localUser.email === firebaseUser.email) {
            // Use localStorage data if it exists (preserves AccountSettings changes)
            setUser(localUser);
          } else {
            // Create new user data from Firebase
            const userData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              isLoggedIn: true,
              provider: 'firebase'
            };
            setUser(userData);
            localStorage.setItem('allRecipesUser', JSON.stringify(userData));
          }
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

  // Helper function to get user from localStorage
  const getLocalStorageUser = () => {
    try {
      const userData = localStorage.getItem('allRecipesUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isLoggedIn) {
          return parsedUser;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('allRecipesUser');
      return null;
    }
  };

  // Check localStorage for user data
  const checkLocalStorageUser = () => {
    const localUser = getLocalStorageUser();
    setUser(localUser);
  };

  // Monitor for password reset completion
  const monitorPasswordReset = async () => {
    try {
      const { auth } = await import('../config/firebase');
      
      // Check if user completed password reset by monitoring auth state
      if (auth.currentUser) {
        const currentUser = auth.currentUser;
        
        // Listen for token refresh which happens after password reset
        currentUser.getIdToken(true).then(() => {
          // If we're here and the user had to get a fresh token,
          // it might indicate a password reset occurred
          console.log('🔄 User token refreshed - checking for password reset');
          
          // Force logout to ensure security after password reset
          logout().then(() => {
            console.log('🔓 Auto-logout completed after password reset');
          });
        }).catch((error) => {
          console.log('Token refresh error (normal):', error.code);
        });
      }
    } catch (error) {
      console.warn('Password reset monitoring not available:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Try Firebase login first
      try {
        const { auth } = await import('../config/firebase');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if we have updated user data in localStorage
        const localUser = getLocalStorageUser();
        if (localUser && localUser.email === userCredential.user.email) {
          // Use localStorage data (preserves AccountSettings changes)
          localUser.isLoggedIn = true;
          localUser.loginAt = new Date().toISOString();
          setUser(localUser);
          localStorage.setItem('allRecipesUser', JSON.stringify(localUser));
          return { success: true, user: localUser };
        } else {
          // Create new user data from Firebase
          const userData = {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
            email: userCredential.user.email,
            password: password, // Store password for localStorage fallback
            isLoggedIn: true,
            provider: 'firebase'
          };
          setUser(userData);
          localStorage.setItem('allRecipesUser', JSON.stringify(userData));
          return { success: true, user: userData };
        }
        
      } catch (firebaseError) {
        console.warn('Firebase login failed, trying localStorage fallback');
        
        // Fallback to localStorage
        const localUser = getLocalStorageUser();
        if (localUser && localUser.email === email) {
          // Check password if it exists
          if (localUser.password && localUser.password !== password) {
            throw new Error('Invalid email or password. Please check your credentials.');
          }
          
          // Update login status
          localUser.isLoggedIn = true;
          localUser.loginAt = new Date().toISOString();
          localUser.provider = 'localStorage';
          
          setUser(localUser);
          localStorage.setItem('allRecipesUser', JSON.stringify(localUser));
          return { success: true, user: localUser };
        } else {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);

      // Try Firebase registration first
      try {
        const { auth } = await import('../config/firebase');
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const userData = {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          password: password, // Store password
          isLoggedIn: true,
          provider: 'firebase'
        };
        
        setUser(userData);
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        return { success: true, user: userData };
        
      } catch (firebaseError) {
        console.warn('Firebase registration failed, using localStorage fallback');
        
        // Fallback to localStorage
        const userData = {
          name: name,
          email: email,
          password: password, // Store password
          registeredAt: new Date().toISOString(),
          isLoggedIn: true,
          provider: 'localStorage'
        };
        
        setUser(userData);
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Try Firebase logout
      try {
        const { auth } = await import('../config/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      } catch (firebaseError) {
        console.warn('Firebase logout failed, using localStorage cleanup');
      }
      
      // Always clear local state
      setUser(null);
      localStorage.removeItem('allRecipesUser');
      return { success: true };
      
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      try {
        const { auth } = await import('../config/firebase');
        const { sendPasswordResetEmail } = await import('firebase/auth');
        
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Password reset email sent!' };
        
      } catch (firebaseError) {
        return { success: true, message: 'Password reset requested (Firebase not configured)' };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    let passwordResetChecker = null;

    // Setup Firebase listener or fallback to localStorage
    setupFirebaseListener().then((unsub) => {
      unsubscribe = unsub;
    });

    // AGGRESSIVE password reset detection
    const checkPasswordResetCompletion = async () => {
      const passwordResetPending = localStorage.getItem('passwordResetPending');
      
      if (passwordResetPending) {
        console.log('🔍 CHECKING FOR PASSWORD RESET COMPLETION...');
        
        try {
          const { auth } = await import('../config/firebase');
          if (auth.currentUser) {
            // Force refresh the user's auth state
            await auth.currentUser.reload();
            
            // Try to get user data - this should fail if password changed
            const currentUser = auth.currentUser;
            console.log('👤 Current Firebase user:', currentUser?.email);
            
            // Force a network call to verify authentication
            try {
              const tokenResult = await currentUser.getIdTokenResult(true);
              console.log('🎫 Token result:', {
                authTime: tokenResult.authTime,
                issuedAtTime: tokenResult.issuedAtTime
              });
              
              // Check if this is a very recent token (indicating password reset)
              const authTime = new Date(tokenResult.authTime).getTime();
              const now = Date.now();
              const authAge = now - authTime;
              
              console.log('⏰ Auth time analysis:');
              console.log('- Auth timestamp:', new Date(authTime));
              console.log('- Current time:', new Date(now));
              console.log('- Auth age (seconds):', authAge / 1000);
              
              // If the auth is very recent (less than 2 minutes old), assume password reset
              if (authAge < 120000) {
                console.log('🚨 RECENT AUTH DETECTED - FORCING LOGOUT!');
                localStorage.removeItem('passwordResetPending');
                forceLogout('Recent authentication detected - password likely reset');
                return;
              }
              
            } catch (tokenError) {
              console.log('❌ TOKEN ERROR - PASSWORD WAS RESET!');
              console.log('Error:', tokenError.code, tokenError.message);
              localStorage.removeItem('passwordResetPending');
              forceLogout('Authentication token invalid - password was reset');
              return;
            }
          } else {
            console.log('❌ NO CURRENT USER - ALREADY LOGGED OUT');
            localStorage.removeItem('passwordResetPending');
            setUser(null);
            localStorage.removeItem('allRecipesUser');
          }
        } catch (error) {
          console.log('🔥 FIREBASE ERROR - FORCING LOGOUT:', error);
          localStorage.removeItem('passwordResetPending');
          forceLogout('Firebase authentication error');
        }
      }
    };

    // Check every 3 seconds for password reset
    passwordResetChecker = setInterval(checkPasswordResetCompletion, 3000);

    // Check immediately when window gains focus
    const handleWindowFocus = () => {
      console.log('👀 WINDOW FOCUSED - IMMEDIATE PASSWORD RESET CHECK');
      setTimeout(checkPasswordResetCompletion, 500);
    };

    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📄 PAGE VISIBLE - CHECKING PASSWORD RESET');
        setTimeout(checkPasswordResetCompletion, 500);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (passwordResetChecker) {
        clearInterval(passwordResetChecker);
      }
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUser, // New function for AccountSettings
    forceLogout, // New function for password reset scenarios
    isAuthenticated: !!user
  };
};