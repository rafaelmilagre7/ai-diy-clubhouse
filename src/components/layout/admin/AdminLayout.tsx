import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "../BaseLayout";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { toast } from "sonner";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

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
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <Text variant="subsection" textColor="primary">Erro no Layout do Admin</Text>
            <Text variant="body" textColor="secondary">
              Ocorreu um erro ao carregar a interface administrativa.
            </Text>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
