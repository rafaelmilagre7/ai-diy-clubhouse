
import React, { useState, useCallback } from "react";

export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
}

export interface BaseContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

interface BaseLayoutProps {
  variant: "member" | "admin" | "formacao";
  sidebarComponent: React.ComponentType<BaseSidebarProps>;
  contentComponent: React.ComponentType<BaseContentProps>;
  onSignOut: () => Promise<void>;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  sidebarComponent: SidebarComponent,
  contentComponent: ContentComponent,
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F111A]">
      <SidebarComponent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
      />
      
      <ContentComponent 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </ContentComponent>
      
      {/* Overlay para mobile quando sidebar está aberto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BaseLayout;
