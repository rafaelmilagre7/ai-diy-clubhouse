
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "./member/MemberSidebar";
import MemberHeader from "./member/MemberHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import DiagnosticPanel from "@/components/common/DiagnosticPanel";

interface MemberLayoutProps {
  children?: ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <MemberSidebar />
      <div className={cn("flex-1 flex flex-col")}>
        <MemberHeader />
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
      
      {/* Painel de diagnóstico */}
      <DiagnosticPanel />
    </div>
  );
};

export default MemberLayout;
