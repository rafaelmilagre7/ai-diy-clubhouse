
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import DiagnosticPanel from "@/components/common/DiagnosticPanel";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Carregando painel administrativo..." />;
  }
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <AdminContent>
        {children || <Outlet />}
      </AdminContent>
      <DiagnosticPanel />
    </div>
  );
};

export default AdminLayout;
