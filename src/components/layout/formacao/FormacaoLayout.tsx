
import React from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "../BaseLayout";
import { FormacaoSidebar } from "./FormacaoSidebar";
import { FormacaoContent } from "./FormacaoContent";
import { FormacaoHealthCheck } from "@/components/learning/member/FormacaoHealthCheck";
import { toast } from "sonner";

/**
 * FormacaoLayout usando BaseLayout unificado
 */
const FormacaoLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();

  // Função para obter iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "F";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handler para signOut com tratamento seguro
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <>
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
      
      {/* Monitor de saúde da API */}
      <FormacaoHealthCheck />
    </>
  );
};

export default FormacaoLayout;
