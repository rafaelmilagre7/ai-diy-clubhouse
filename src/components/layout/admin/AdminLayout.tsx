
import React from "react";
import { useAuth } from "@/contexts/auth";
import BaseLayout from "../BaseLayout";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { toast } from "sonner";

/**
 * AdminLayout usando BaseLayout unificado
 */
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();

  // Função para obter iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "A";
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
      variant="admin"
      sidebarComponent={AdminSidebar}
      contentComponent={AdminContent}
      onSignOut={handleSignOut}
      profileName={profile?.name || null}
      profileEmail={profile?.email || null}
      profileAvatar={profile?.avatar_url}
      getInitials={getInitials}
    >
      <div className="w-full">
        {children}
      </div>
    </BaseLayout>
  );
};

export default AdminLayout;
