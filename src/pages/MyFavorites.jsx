import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';
import './MyFavorites.css';

const MyFavorites = () => {
  const { favorites, loading } = useFavorites();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    const user = getCurrentUser();
    
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoaded(true);
  }, [navigate]);

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="my-favorites-container">
        <div className="favorites-header">
          <h1>My Favorites</h1>
        </div>
        <div className="favorites-loading">
          <div className="loading-spinner"></div>
          <p>Loading your favorite recipes...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (favorites.length === 0) {
    return (
      <div className="my-favorites-container">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <p className="favorites-subtitle">Your saved recipes will appear here</p>
        </div>
        
        <div className="empty-favorites">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2>No Favorites Yet</h2>
          <p>Start exploring and save your favorite recipes by clicking the heart icon on any recipe!</p>
          <Link to="/" className="browse-recipes-btn">
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-favorites-container">
      <div className="favorites-header">
        <h1>My Favorites</h1>
        <p className="favorites-subtitle">
          {favorites.length} recipe{favorites.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="favorites-grid">
        {favorites.map((recipe) => (
          <div key={recipe.id} className="favorite-recipe-card">
            <div className="recipe-card-inner">
              <Link to={`/recipe/${recipe.id}`} className="recipe-link">
                <div className="recipe-image-container">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="recipe-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                    }}
                  />
                  <div className="recipe-overlay">
                    <h3 className="recipe-title">{recipe.title}</h3>
                  </div>
                </div>
              </Link>
              
              <div className="recipe-card-content">
                <div className="recipe-info">
                  <h4 className="recipe-card-title">{recipe.title}</h4>
                  {recipe.summary && (
                    <p className="recipe-summary">
                      {recipe.summary.length > 100 
                        ? `${recipe.summary.substring(0, 100)}...` 
                        : recipe.summary
                      }
                    </p>
                  )}
                  <div className="recipe-meta">
                    <span className="date-added">
                      Added on {new Date(recipe.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="recipe-actions">
                  <FavoriteButton 
                    recipe={recipe} 
                    size="small" 
                    showToast={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFavorites;