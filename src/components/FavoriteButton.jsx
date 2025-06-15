import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import './FavoriteButton.css';

const FavoriteButton = ({ recipe, size = 'medium', showToast = true }) => {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isFav = isFavorited(recipe.id);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('allRecipesUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return parsedUser.isLoggedIn ? parsedUser : null;
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return null;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = getCurrentUser();

    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    // Prevent multiple clicks during animation
    if (isAnimating) return;

    setIsAnimating(true);
    
    try {
      const wasAdded = toggleFavorite(recipe);
      
      // Show toast notification if enabled
      if (showToast) {
        showToastNotification(wasAdded ? 'Added to favorites!' : 'Removed from favorites!');
      }
      
      // Animation duration
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsAnimating(false);
    }
  };

  const showToastNotification = (message) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'favorite-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'favorite-btn-small';
      case 'large': return 'favorite-btn-large';
      default: return 'favorite-btn-medium';
    }
  };

  return (
    <div className="favorite-button-container">
      <button
        className={`favorite-button ${getSizeClass()} ${isFav ? 'favorited' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className="heart-icon"
          viewBox="0 0 24 24"
          fill={isFav ? '#ff6b35' : 'none'}
          stroke={isFav ? '#ff6b35' : '#666'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        
        {/* Pulse effect for animation */}
        {isAnimating && <div className="heart-pulse"></div>}
      </button>

      {/* Login prompt tooltip */}
      {showLoginPrompt && (
        <div className="login-prompt-tooltip">
          <span>Please log in to save favorites</span>
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;