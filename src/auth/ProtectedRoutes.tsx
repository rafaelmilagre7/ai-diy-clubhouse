
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
// Removido SecurityProvider - já está no App.tsx
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();

  console.log("[PROTECTED] Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    currentPath: location.pathname
  });

  // Loading direto - sem timeouts
  if (isLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login imediatamente
  if (!user) {
    console.log("[PROTECTED] Sem usuário - redirecionando para login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sem perfil = erro crítico
  if (!profile) {
    console.error("[PROTECTED] ERRO CRÍTICO: Usuário sem perfil");
    throw new Error(`Usuário ${user.id} não possui perfil válido. Dados corrompidos.`);
  }

  // Tudo ok - renderizar conteúdo
  return children;
};
