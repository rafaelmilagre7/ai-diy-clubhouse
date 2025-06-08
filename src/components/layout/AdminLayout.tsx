
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

  console.log('[AdminLayout] Renderizando com:', {
    profile: !!profile,
    profileName: profile?.name,
    hasChildren: !!children
  });

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
      console.error('[AdminLayout] Erro no signOut:', error);
      toast.error("Erro ao fazer logout");
    }
  }, [signOut]);

  // Memoizar dados do perfil para evitar re-renders desnecessários
  const profileData = useMemo(() => ({
    name: profile?.name || null,
    email: profile?.email || null,
    avatar: profile?.avatar_url
  }), [profile?.name, profile?.email, profile?.avatar_url]);

  try {
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
  } catch (error) {
    console.error('[AdminLayout] Erro ao renderizar:', error);
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erro no Layout do Admin</h2>
          <p className="text-muted-foreground">Ocorreu um erro ao carregar a interface administrativa.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
