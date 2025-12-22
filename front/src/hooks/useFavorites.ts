import { useState, useCallback, useEffect } from 'react';

export interface Favorite<T> {
  id: string;
  data: T;
  addedAt: number;
}

export const useFavorites = <T,>(type: string) => {
  const key = `favorites_${type}`;
  const [favorites, setFavorites] = useState<Favorite<T>[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error(`Erro ao carregar favoritos de ${type}:`, e);
      }
    }
  }, [key, type]);


  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, key]);

  const toggleFavorite = useCallback((id: string, data: T) => {
    setFavorites((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index > -1) {
        return prev.filter((_, i) => i !== index);
      } else {
        return [
          { id, data, addedAt: Date.now() },
          ...prev,
        ];
      }
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some((f) => f.id === id);
  }, [favorites]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites,
  };
};
