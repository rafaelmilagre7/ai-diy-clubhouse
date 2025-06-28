
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentLayout: 'admin' | 'member' | 'formacao' | 'public';
  isMobile: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Determine current layout based on route
  const getCurrentLayout = (): 'admin' | 'member' | 'formacao' | 'public' => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/formacao')) return 'formacao';
    if (location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/solutions') ||
        location.pathname.startsWith('/tools') ||
        location.pathname.startsWith('/community')) return 'member';
    return 'public';
  };

  const currentLayout = getCurrentLayout();

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const value: LayoutContextType = {
    sidebarOpen,
    setSidebarOpen,
    currentLayout,
    isMobile
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
