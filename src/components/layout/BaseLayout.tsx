
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface BaseLayoutProps {
  variant: "member" | "admin" | "formacao";
  sidebarComponent: React.ComponentType<BaseSidebarProps>;
  contentComponent: React.ComponentType<{
    children: React.ReactNode;
    onSignOut: () => void;
    profileName: string | null;
    profileEmail: string | null;
    profileAvatar?: string;
    getInitials: (name: string | null) => string;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
  }>;
  children: React.ReactNode;
  onSignOut: () => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  sidebarComponent: SidebarComponent,
  contentComponent: ContentComponent,
  children,
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  sidebarOpen: propSidebarOpen,
  setSidebarOpen: propSetSidebarOpen,
}) => {
  // Estado local como fallback se não for passado como prop
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false);
  
  // Usar props se fornecidas, senão usar estado local
  const sidebarOpen = propSidebarOpen ?? localSidebarOpen;
  const setSidebarOpen = propSetSidebarOpen ?? setLocalSidebarOpen;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarComponent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}>
        <ContentComponent
          onSignOut={onSignOut}
          profileName={profileName}
          profileEmail={profileEmail}
          profileAvatar={profileAvatar}
          getInitials={getInitials}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        >
          {children}
        </ContentComponent>
      </div>
    </div>
  );
};

export default BaseLayout;
