
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './useResponsive';

interface SidebarControlReturn {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

/**
 * Hook centralizado para controle do sidebar com persistência e responsividade
 */
export const useSidebarControl = (): SidebarControlReturn => {
  const isMobile = useIsMobile();
  
  // Estado inicial: desktop aberto, mobile fechado
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    if (typeof window === 'undefined') return true;
    
    // Verificar preferência salva
    const savedState = localStorage.getItem('sidebar-open');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    
    // Padrão: desktop aberto, mobile fechado
    return !isMobile;
  });

  // Persistir estado no localStorage
  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
    localStorage.setItem('sidebar-open', JSON.stringify(open));
  }, []);

  // Toggle function
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Ajustar comportamento baseado no dispositivo
  useEffect(() => {
    // Em mobile, começar sempre fechado se não há preferência
    if (isMobile && localStorage.getItem('sidebar-open') === null) {
      setSidebarOpenState(false);
    }
  }, [isMobile]);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    isMobile
  };
};
