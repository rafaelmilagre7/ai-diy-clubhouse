
import React from "react";
import { MemberHeader } from "./MemberHeader";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
      // Ajustar margem baseado no estado do sidebar
      sidebarOpen ? "md:ml-64" : "md:ml-16",
      // Em mobile, ocupar toda a largura sempre
      "ml-0"
    )}>
      <MemberHeader
        onSignOut={onSignOut}
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className="flex-1 p-lg overflow-auto">
        {children}
      </main>
    </div>
  );
};
