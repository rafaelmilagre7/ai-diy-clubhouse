
import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "./BaseLayout";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { toast } from "sonner";
import { PremiumUpgradeModalProvider } from "@/hooks/usePremiumUpgradeModal";

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = memo<MemberLayoutProps>(({ children }) => {
  const { profile, signOut } = useAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar, isMobile } = useSidebarControl();

  // Removido log para evitar loops de renderização

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

  // Memoizar handler de signOut com tratamento seguro
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[MemberLayout] Erro no signOut:', error);
      }
      toast.error("Erro ao fazer logout");
    }
  }, [signOut]);

  // Memoizar dados do perfil
  const profileData = useMemo(() => ({
    name: profile?.name || null,
    email: profile?.email || null,
    avatar: profile?.avatar_url
  }), [profile?.name, profile?.email, profile?.avatar_url]);

  try {
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
        
        <PremiumUpgradeModalProvider>
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
        </PremiumUpgradeModalProvider>
      </>
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[MemberLayout] Erro ao renderizar:', error);
    }
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erro no Layout do Membro</h2>
          <p className="text-muted-foreground">Ocorreu um erro ao carregar a interface.</p>
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

MemberLayout.displayName = 'MemberLayout';

export default MemberLayout;
