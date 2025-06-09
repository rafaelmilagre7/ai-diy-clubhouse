
import React from "react";
import { MemberHeader } from "./MemberHeader";

interface MemberContentProps {
  children: React.ReactNode;
  onSignOut: () => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberContent: React.FC<MemberContentProps> = ({
  children,
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MemberHeader
        onSignOut={onSignOut}
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
