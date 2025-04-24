
import { ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberHeader } from "./member/MemberHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import DiagnosticPanel from "@/components/common/DiagnosticPanel";
import { MemberContent } from "./member/MemberContent";

interface MemberLayoutProps {
  children?: ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const { isLoading, user, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Função para extrair iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <MemberSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        profileName={user?.user_metadata?.name || null}
        profileEmail={user?.email || null}
        profileAvatar={user?.user_metadata?.avatar_url}
        getInitials={getInitials}
        signOut={signOut}
      />
      <MemberContent 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children || <Outlet />}
      </MemberContent>
      
      {/* Painel de diagnóstico */}
      <DiagnosticPanel />
    </div>
  );
};

export default MemberLayout;
