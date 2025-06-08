
import React, { useState } from 'react';

export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export interface BaseContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}

interface BaseLayoutProps {
  variant: 'member' | 'admin' | 'formacao';
  sidebarComponent: React.ComponentType<BaseSidebarProps>;
  contentComponent: React.ComponentType<BaseContentProps>;
  onSignOut: () => void;
  profileName?: string | null;
  profileEmail?: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  sidebarComponent: SidebarComponent,
  contentComponent: ContentComponent,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <SidebarComponent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      <ContentComponent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </ContentComponent>
    </div>
  );
};

export default BaseLayout;
