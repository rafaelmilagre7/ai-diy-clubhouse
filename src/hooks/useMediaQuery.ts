
import { useState, useEffect } from 'react';

/**
 * Hook personalizado que verifica se um media query é correspondido
 * 
 * @param query - A media query a ser verificada (ex: '(min-width: 768px)')
 * @returns Boolean indicando se o media query corresponde
 */
export const useMediaQuery = (query: string): boolean => {
  // Inicializar com false e atualizar no useEffect para evitar problemas de SSR
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Verificar se window está disponível (para evitar problemas de SSR)
    if (typeof window === 'undefined') return;
    
    // Criar o MediaQueryList
    const media = window.matchMedia(query);
    
    // Função para atualizar o estado
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Atualizar o estado com o valor inicial
    updateMatches();
    
    // Adicionar o listener para mudanças
    // Usando addEventListener para compatibilidade com navegadores modernos
    media.addEventListener('change', updateMatches);
    
    // Limpar o listener ao desmontar
    return () => media.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
};
