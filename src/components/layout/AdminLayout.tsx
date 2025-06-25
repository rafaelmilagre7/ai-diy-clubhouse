
import React, { memo, useMemo, useCallback, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = memo<AdminLayoutProps>(({ children }) => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Memoizar função para obter iniciais
  const getInitials = useCallback((name: string | null) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // Memoizar handler de signOut
  const handleSignOut = useCallback(async () => {
    try {
      const result = await signOut();
      if (result.success) {
        toast.success("Logout realizado com sucesso");
      } else {
        toast.error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error('[AdminLayout] Erro no signOut:', error);
      toast.error("Erro ao fazer logout");
    }
  }, [signOut]);

  // Memoizar dados do perfil
  const profileData = useMemo(() => ({
    name: profile?.name || null,
    email: profile?.email || null,
    avatar: profile?.avatar_url
  }), [profile?.name, profile?.email, profile?.avatar_url]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <AdminContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </AdminContent>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
