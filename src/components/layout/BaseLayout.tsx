
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import AsyncErrorBoundary from "@/components/common/AsyncErrorBoundary";

export type LayoutVariant = 'member' | 'admin' | 'formacao';

interface BaseLayoutProps {
  children: React.ReactNode;
  variant: LayoutVariant;
  sidebarComponent: React.ComponentType<BaseSidebarProps>;
  contentComponent: React.ComponentType<BaseContentProps>;
  onSignOut?: () => Promise<void>;
  profileName?: string | null;
  profileEmail?: string | null;
  profileAvatar?: string;
  getInitials?: (name: string | null) => string;
}

export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName?: string | null;
  profileEmail?: string | null;
  profileAvatar?: string;
  getInitials?: (name: string | null) => string;
}

export interface BaseContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const BaseLayout = memo<BaseLayoutProps>(({ 
  children, 
  variant,
  sidebarComponent: SidebarComponent,
  contentComponent: ContentComponent,
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}) => {
  // Usar hook responsivo otimizado
  const { isMobile } = useResponsive({ 
    mobileBreakpoint: 768, 
    debounceMs: 150 
  });
  
  // Memoizar o estado inicial da sidebar baseado no localStorage
  const initialSidebarState = useMemo(() => {
    const savedState = localStorage.getItem(`${variant}SidebarOpen`);
    return savedState !== null ? savedState === "true" : !isMobile;
  }, [variant, isMobile]);

  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarState);
  const [showOverlay, setShowOverlay] = useState(false);

  // Memoizar o handler de toggle da sidebar para evitar re-criação
  const handleSidebarToggle = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  // Memoizar o handler do overlay para evitar re-criação
  const handleOverlayClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Memoizar a classe de background baseada no variant
  const backgroundClass = useMemo(() => 
    variant === 'member' ? 'bg-[#0F111A]' : 'bg-background'
  , [variant]);

  // Persistir estado da sidebar com memoização da key
  const storageKey = useMemo(() => `${variant}SidebarOpen`, [variant]);
  
  useEffect(() => {
    localStorage.setItem(storageKey, String(sidebarOpen));
  }, [sidebarOpen, storageKey]);

  // Atualizar overlay baseado no estado da sidebar em mobile
  useEffect(() => {
    setShowOverlay(isMobile && sidebarOpen);
  }, [isMobile, sidebarOpen]);

  // Fechar sidebar automaticamente em mobile quando redimensionar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handler para touch/swipe para fechar sidebar - memoizado
  useEffect(() => {
    if (!showOverlay) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Detectar swipe para a esquerda (fechar sidebar)
      if (deltaX < -50 && Math.abs(deltaY) < 100) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showOverlay]);

  // Forçar tema escuro para todos os layouts
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  // Memoizar as props da sidebar para evitar re-renders desnecessários
  const sidebarProps = useMemo(() => ({
    sidebarOpen,
    setSidebarOpen: handleSidebarToggle,
    profileName,
    profileEmail,
    profileAvatar,
    getInitials
  }), [sidebarOpen, handleSidebarToggle, profileName, profileEmail, profileAvatar, getInitials]);

  // Memoizar as props do content para evitar re-renders desnecessários
  const contentProps = useMemo(() => ({
    sidebarOpen,
    setSidebarOpen: handleSidebarToggle,
    children
  }), [sidebarOpen, handleSidebarToggle, children]);

  return (
    <ErrorBoundary maxRetries={2} showDetails={false}>
      <div className={cn("flex min-h-screen overflow-hidden", backgroundClass)}>
        {/* Overlay para dispositivos móveis */}
        {showOverlay && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
            onClick={handleOverlayClick}
            aria-label="Fechar menu"
          />
        )}
        
        {/* Sidebar com error boundary */}
        <AsyncErrorBoundary maxRetries={1} autoRetry={false}>
          <SidebarComponent {...sidebarProps} />
        </AsyncErrorBoundary>
        
        {/* Conteúdo principal com error boundary */}
        <AsyncErrorBoundary maxRetries={2} autoRetry={true}>
          <ContentComponent {...contentProps} />
        </AsyncErrorBoundary>
      </div>
    </ErrorBoundary>
  );
});

BaseLayout.displayName = 'BaseLayout';

export default BaseLayout;
