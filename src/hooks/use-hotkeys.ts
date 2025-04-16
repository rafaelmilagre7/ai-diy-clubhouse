
import { useEffect } from "react";

/**
 * Hook para adicionar atalhos de teclado
 * @param key - Tecla ou combinação de teclas para detectar
 * @param callback - Função a ser executada quando a tecla for pressionada
 * @param deps - Dependências para o useEffect
 */
export const useHotkeys = (
  key: string | string[],
  callback: (event: KeyboardEvent) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const keys = Array.isArray(key) ? key : [key];
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        callback(event);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
};
