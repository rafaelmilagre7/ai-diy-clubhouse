
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Atualiza o estado com o valor inicial
    setMatches(media.matches);
    
    // Define um listener para mudanças futuras
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Adiciona o listener
    media.addEventListener('change', listener);
    
    // Remove o listener ao desmontar
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};
