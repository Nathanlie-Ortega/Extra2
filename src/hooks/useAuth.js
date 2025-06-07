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
        const userData = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
          email: userCredential.user.email,
          isLoggedIn: true,
          provider: 'firebase'
        };
        
        setUser(userData);
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        return { success: true, user: userData };
        
      } catch (firebaseError) {
        // Fallback to localStorage
        const userData = {
          email: email,
          isLoggedIn: true,
          loginAt: new Date().toISOString(),
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
          isLoggedIn: true,
          provider: 'firebase'
        };
        
        setUser(userData);
        localStorage.setItem('allRecipesUser', JSON.stringify(userData));
        return { success: true, user: userData };
        
      } catch (firebaseError) {
        // Fallback to localStorage
        const userData = {
          name: name,
          email: email,
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

    // Setup Firebase listener or fallback to localStorage
    setupFirebaseListener().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
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
    isAuthenticated: !!user
  };
};