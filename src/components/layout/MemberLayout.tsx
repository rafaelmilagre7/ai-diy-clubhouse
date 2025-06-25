
import React, { memo, useMemo, useCallback } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import BaseLayout from "./BaseLayout";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { toast } from "sonner";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = memo<MemberLayoutProps>(({ children }) => {
  const { profile, signOut } = useSimpleAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar, isMobile } = useSidebarControl();

  // Memoizar função para obter iniciais
  const getInitials = useCallback((name: string | null) => {
    if (!name) return "U";
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
        // Redirecionar para auth
        window.location.href = '/auth';
      } else {
        toast.error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error('[MemberLayout] Erro no signOut:', error);
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
    <>
      {/* Backdrop para mobile quando sidebar aberto */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      
      <BaseLayout
        variant="member"
        sidebarComponent={MemberSidebar}
        contentComponent={MemberContent}
        onSignOut={handleSignOut}
        profileName={profileData.name}
        profileEmail={profileData.email}
        profileAvatar={profileData.avatar}
        getInitials={getInitials}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </BaseLayout>
    </>
  );
});

MemberLayout.displayName = 'MemberLayout';

export default MemberLayout;
