
import React from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "../BaseLayout";
import { FormacaoSidebar } from "./FormacaoSidebar";
import { FormacaoContent } from "./FormacaoContent";
import { toast } from "sonner";

interface FormacaoLayoutProps {
  children: React.ReactNode;
}

/**
 * FormacaoLayout usando BaseLayout unificado com otimização de re-renders
 */
const FormacaoLayout = React.memo(({ children }: FormacaoLayoutProps) => {
  const { profile, signOut } = useAuth();

  // Função para obter iniciais do nome do usuário
  const getInitials = React.useCallback((name: string | null) => {
    if (!name) return "F";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // Handler para signOut
  const handleSignOut = React.useCallback(async () => {
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

  return (
    <BaseLayout
      variant="formacao"
      sidebarComponent={FormacaoSidebar}
      contentComponent={FormacaoContent}
      onSignOut={handleSignOut}
      profileName={profile?.name || null}
      profileEmail={profile?.email || null}
      profileAvatar={profile?.avatar_url}
      getInitials={getInitials}
    >
      {children}
    </BaseLayout>
  );
});

FormacaoLayout.displayName = 'FormacaoLayout';

export default FormacaoLayout;
