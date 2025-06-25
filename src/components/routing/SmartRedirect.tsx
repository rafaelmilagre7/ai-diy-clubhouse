
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";
import { getUserRoleName } from "@/lib/supabase/types";

interface SmartRedirectProps {
  fallback?: string;
}

export const SmartRedirect = ({ fallback = '/dashboard' }: SmartRedirectProps) => {
  const { user, profile, isLoading } = useAuth();

  if (import.meta.env.DEV) {
    logger.info("[SMART-REDIRECT] Estado:", {
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile ? getUserRoleName(profile) : 'none',
      isLoading,
      fallback
    });
  }

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !profile) {
    return <Navigate to="/onboarding" replace />;
  }

  // Roteamento inteligente baseado no papel do usuário
  const userRole = getUserRoleName(profile);
  
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'formacao':
      return <Navigate to="/formacao" replace />;
    case 'membro_club':
    default:
      return <Navigate to={fallback} replace />;
  }
};
