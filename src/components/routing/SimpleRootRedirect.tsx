
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";
import { getUserRoleName } from "@/lib/supabase/types";

const SimpleRootRedirect = () => {
  const { user, profile, isLoading } = useAuth();

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    logger.info("[SIMPLE-ROOT] Estado:", {
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading
    });
  }

  // Loading simples
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Sem usuário = login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Com usuário mas sem perfil = aguardar
  if (user && !profile) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Roteamento baseado no papel do usuário
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Padrão = dashboard (membros)
  return <Navigate to="/dashboard" replace />;
};

export default SimpleRootRedirect;
