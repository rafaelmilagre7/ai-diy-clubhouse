
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";
import { getUserRoleName } from "@/lib/supabase/types";

const EmergencyRootRedirect = () => {
  const { user, profile, isLoading } = useAuth();

  // Log mínimo apenas
  if (import.meta.env.DEV) {
    logger.info("[EMERGENCY-ROOT] Estado:", {
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading
    });
  }

  // Loading direto - sem timeouts complexos
  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Sem usuário = login (direto)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Com usuário mas sem perfil = aguardar brevemente
  if (user && !profile) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Roteamento baseado no papel (simplificado)
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Padrão = dashboard
  return <Navigate to="/dashboard" replace />;
};

export default EmergencyRootRedirect;
