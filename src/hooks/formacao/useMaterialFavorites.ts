import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";

export const useMaterialFavorites = () => {
  const { profile } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    if (profile?.id) {
      const stored = localStorage.getItem(`material-favorites-${profile.id}`);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error);
          setFavorites([]);
        }
      }
    }
  }, [profile?.id]);

  // Salvar favoritos no localStorage
  const saveFavorites = (newFavorites: string[]) => {
    if (profile?.id) {
      localStorage.setItem(`material-favorites-${profile.id}`, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    }
  };

  // Toggle favorito
  const toggleFavorite = (materialId: string) => {
    const newFavorites = favorites.includes(materialId)
      ? favorites.filter(id => id !== materialId)
      : [...favorites, materialId];
    
    saveFavorites(newFavorites);
  };

  // Verificar se é favorito
  const isFavorite = (materialId: string) => favorites.includes(materialId);

  // Limpar favoritos
  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
};