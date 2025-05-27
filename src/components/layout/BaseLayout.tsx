
import React, { useState, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { logger } from "@/utils/logger";

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
  const { isMobile } = useResponsive();
  
  // Estado da sidebar com persistência
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem(`${variant}SidebarOpen`);
    return savedState !== null ? savedState === "true" : !isMobile;
  });

  // Estado do overlay para mobile
  const [showOverlay, setShowOverlay] = useState(false);

  // Persistir estado da sidebar
  useEffect(() => {
    localStorage.setItem(`${variant}SidebarOpen`, String(sidebarOpen));
  }, [sidebarOpen, variant]);

  // Atualizar overlay baseado no estado da sidebar em mobile
  useEffect(() => {
    setShowOverlay(isMobile && sidebarOpen);
  }, [isMobile, sidebarOpen]);

  // Fechar sidebar automaticamente em mobile quando redimensionar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      // Em mobile, manter sidebar fechada por padrão
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handler para fechar overlay/sidebar
  const handleOverlayClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handler para touch/swipe para fechar sidebar
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

  // Handler para sidebar toggle
  const handleSidebarToggle = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  const backgroundClass = variant === 'member' ? 'bg-[#0F111A]' : 'bg-background';

  return (
    <div className={cn("flex min-h-screen overflow-hidden", backgroundClass)}>
      {/* Overlay para dispositivos móveis */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-label="Fechar menu"
        />
      )}
      
      {/* Sidebar */}
      <SidebarComponent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={handleSidebarToggle}
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
      />
      
      {/* Conteúdo principal */}
      <ContentComponent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={handleSidebarToggle}
      >
        {children}
      </ContentComponent>
    </div>
  );
});

BaseLayout.displayName = 'BaseLayout';

export default BaseLayout;
