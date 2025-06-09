
import React, { useState } from "react";

export interface BaseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export interface BaseContentProps extends BaseSidebarProps {
  children: React.ReactNode;
}

interface BaseLayoutProps {
  variant: "admin" | "member" | "formacao";
  sidebarComponent: React.ComponentType<any>;
  contentComponent: React.ComponentType<BaseContentProps>;
  onSignOut: () => Promise<void>;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  variant,
  sidebarComponent: SidebarComponent,
  contentComponent: ContentComponent,
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarComponent 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSignOut={onSignOut}
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
    </div>
  );
};

export default BaseLayout;
