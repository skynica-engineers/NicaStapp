import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextData {
  favoriteTeamIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>([]);
  const STORAGE_KEY = '@nicastapp_favorites';

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFavs) {
        setFavoriteTeamIds(JSON.parse(storedFavs));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  };

  const saveFavorites = async (newFavs: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  };

  const addFavorite = (id: string) => {
    setFavoriteTeamIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      saveFavorites(updated);
      return updated;
    });
  };

  const removeFavorite = (id: string) => {
    setFavoriteTeamIds(prev => {
      const updated = prev.filter(favId => favId !== id);
      saveFavorites(updated);
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteTeamIds(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(favId => favId !== id);
      } else {
        updated = [...prev, id];
      }
      saveFavorites(updated);
      return updated;
    });
  };

  const isFavorite = (id: string) => favoriteTeamIds.includes(id);

  return (
    <FavoritesContext.Provider value={{ favoriteTeamIds, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
