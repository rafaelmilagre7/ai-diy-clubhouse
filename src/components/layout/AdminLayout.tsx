
import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "./BaseLayout";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout usando BaseLayout unificado com otimizações de performance
 */
const AdminLayout = memo<AdminLayoutProps>(({ children }) => {
  const { profile, signOut } = useAuth();

  // Memoizar função para obter iniciais para evitar recriação
  const getInitials = useCallback((name: string | null) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // Memoizar handler de signOut para evitar recriação
  const handleSignOut = useCallback(async () => {
    try {
      const result = await signOut();
      if (result.success) {
        toast.success("Logout realizado com sucesso");
      } else {
        toast.error("Erro ao fazer logout");
      }
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  }, [signOut]);

  // Memoizar dados do perfil para evitar re-renders desnecessários
  const profileData = useMemo(() => ({
    name: profile?.name || null,
    email: profile?.email || null,
    avatar: profile?.avatar_url
  }), [profile?.name, profile?.email, profile?.avatar_url]);

  return (
    <BaseLayout
      variant="admin"
      sidebarComponent={AdminSidebar}
      contentComponent={AdminContent}
      onSignOut={handleSignOut}
      profileName={profileData.name}
      profileEmail={profileData.email}
      profileAvatar={profileData.avatar}
      getInitials={getInitials}
    >
      {children}
    </BaseLayout>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
