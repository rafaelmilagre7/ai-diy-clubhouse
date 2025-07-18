
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [emergencyRedirect, setEmergencyRedirect] = useState(false);
  
  console.log("🔄 [ROOT-REDIRECT] RENDER:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    timestamp: new Date().toISOString()
  });
  
  // TIMEOUT DE EMERGÊNCIA - 3 segundos
  useEffect(() => {
    console.log("🔄 [ROOT-REDIRECT] Configurando timeout de emergência");
    const timeout = setTimeout(() => {
      console.error("🚨 [ROOT-REDIRECT] TIMEOUT DE EMERGÊNCIA");
      setEmergencyRedirect(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // REDIRECIONAMENTO DE EMERGÊNCIA
  if (emergencyRedirect) {
    console.error("🚨 [ROOT-REDIRECT] Redirecionamento de emergência ativado");
    return <Navigate to="/login" replace />;
  }

  // LÓGICA SUPER SIMPLIFICADA
  if (authLoading) {
    console.log("⏳ [ROOT-REDIRECT] Ainda carregando...");
    return <LoadingScreen message="Carregando..." />;
  }

  if (!user) {
    console.log("↩️ [ROOT-REDIRECT] Sem usuário - Indo para login");
    return <Navigate to="/login" replace />;
  }

  // USUÁRIO LOGADO EM /login: Redirecionar para dashboard apropriado
  if (location.pathname === '/login') {
    const roleName = getUserRoleName(profile);
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para dashboard");
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // REDIRECIONAMENTO POR ROLE na página inicial
  if (location.pathname === '/') {
    const roleName = getUserRoleName(profile);
    console.log(`🎯 [ROOT-REDIRECT] Página inicial - redirecionando para: ${roleName === 'formacao' ? '/formacao' : '/dashboard'}`);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // DEIXAR OUTRAS ROTAS PASSAREM
  return null;
};

export default RootRedirect;
