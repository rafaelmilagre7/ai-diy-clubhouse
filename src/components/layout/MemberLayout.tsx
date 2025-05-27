
import React from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "./BaseLayout";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { toast } from "sonner";

/**
 * MemberLayout usando BaseLayout unificado
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();

  // Função para obter iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handler para signOut
  const handleSignOut = async () => {
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
  };

  return (
    <BaseLayout
      variant="member"
      sidebarComponent={MemberSidebar}
      contentComponent={MemberContent}
      onSignOut={handleSignOut}
      profileName={profile?.name || null}
      profileEmail={profile?.email || null}
      profileAvatar={profile?.avatar_url}
      getInitials={getInitials}
    >
      {children}
    </BaseLayout>
  );
};

export default MemberLayout;
