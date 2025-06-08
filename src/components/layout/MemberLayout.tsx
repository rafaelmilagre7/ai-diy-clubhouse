
import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "./BaseLayout";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { useForumNotifications } from "@/hooks/community/useForumNotifications";
import { toast } from "sonner";

interface MemberLayoutProps {
  children: React.ReactNode;
}

/**
 * MemberLayout usando BaseLayout unificado com otimizações de performance
 */
const MemberLayout = memo<MemberLayoutProps>(({ children }) => {
  const { profile, signOut } = useAuth();

  // Inicializar notificações do fórum
  useForumNotifications();

  // Memoizar função para obter iniciais para evitar recriação
  const getInitials = useCallback((name: string | null) => {
    if (!name) return "M";
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
      variant="member"
      sidebarComponent={MemberSidebar}
      contentComponent={MemberContent}
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

MemberLayout.displayName = 'MemberLayout';

export default MemberLayout;
