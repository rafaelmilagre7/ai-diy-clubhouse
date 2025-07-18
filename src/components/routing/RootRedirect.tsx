
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // TIMEOUT DE SEGURANÇA: Aumentado para 8 segundos para permitir autenticação completa
  useEffect(() => {
    if (authLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("⏰ [ROOT-REDIRECT] Timeout de loading atingido - forçando redirecionamento");
        setTimeoutReached(true);
      }, 8000); // Aumentado para 8s para dar tempo da auth completar
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTimeoutReached(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authLoading]);

  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading: authLoading,
    timeoutReached
  });

  // LOADING NORMAL: Mostrar tela de carregamento (prioridade)
  if (authLoading && !timeoutReached) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // TIMEOUT ATINGIDO: Fallback para login apenas se não há usuário
  if (timeoutReached && !user) {
    console.warn("⚠️ [ROOT-REDIRECT] Timeout - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // SEM USUÁRIO: Redirecionar para login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // SEM PERFIL: Erro crítico - não deveria acontecer
  if (!profile) {
    if (authLoading) {
      return <LoadingScreen message="Carregando perfil..." />;
    }
    
    console.error("💥 [ROOT-REDIRECT] ERRO CRÍTICO: Usuário sem perfil após loading");
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
