import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites();
  }, []);

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const storedFavorites = localStorage.getItem('recipe-favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  // Save favorites to localStorage
  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('recipe-favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Add recipe to favorites
  const addToFavorites = (recipe) => {
    if (!recipe || !recipe.id) return;

    // Check if already favorited
    if (isFavorited(recipe.id)) return;

    const favoriteItem = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary || '',
      dateAdded: new Date().toISOString()
    };

    const newFavorites = [...favorites, favoriteItem];
    saveFavorites(newFavorites);
  };

  // Remove recipe from favorites
  const removeFromFavorites = (recipeId) => {
    const newFavorites = favorites.filter(fav => fav.id !== recipeId);
    saveFavorites(newFavorites);
  };

  // Check if recipe is favorited
  const isFavorited = (recipeId) => {
    return favorites.some(fav => fav.id === recipeId);
  };

  // Toggle favorite status
  const toggleFavorite = (recipe) => {
    if (isFavorited(recipe.id)) {
      removeFromFavorites(recipe.id);
      return false; // Removed
    } else {
      addToFavorites(recipe);
      return true; // Added
    }
  };

  // Clear all favorites
  const clearFavorites = () => {
    saveFavorites([]);
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    toggleFavorite,
    clearFavorites,
    loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};