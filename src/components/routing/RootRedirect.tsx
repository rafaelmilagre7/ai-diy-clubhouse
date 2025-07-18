
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [redirectCount, setRedirectCount] = useState(0);
  const [emergencyTimeout, setEmergencyTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const emergencyRef = useRef<NodeJS.Timeout>();
  const MAX_REDIRECTS = 3;
  
  console.log("🔄 [ROOT-REDIRECT] RENDER:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    timeoutReached,
    redirectCount,
    emergencyTimeout
  });
  
  // TIMEOUT SINCRONIZADO: 6 segundos (MESMO EM TODOS OS COMPONENTES)
  useEffect(() => {
    if (authLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("⏰ [ROOT-REDIRECT] Timeout de loading atingido - forçando redirecionamento");
        setTimeoutReached(true);
      }, 6000); // SINCRONIZADO EM 6s
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

  // TIMEOUT DE EMERGÊNCIA ABSOLUTO: Se nada funcionar em 10s, forçar login
  useEffect(() => {
    emergencyRef.current = setTimeout(() => {
      console.error("🚨 [ROOT-REDIRECT] TIMEOUT DE EMERGÊNCIA - Forçando login absoluto");
      setEmergencyTimeout(true);
    }, 10000); // 10s timeout de emergência

    return () => {
      if (emergencyRef.current) {
        clearTimeout(emergencyRef.current);
      }
    };
  }, []);

  // EMERGÊNCIA ABSOLUTA: Quebrar qualquer loop
  if (emergencyTimeout) {
    console.error("🆘 [ROOT-REDIRECT] EMERGÊNCIA ATIVADA - Redirecionamento forçado");
    return <Navigate to="/login" replace />;
  }

  // PROTEÇÃO ANTI-LOOP: Contar redirecionamentos
  useEffect(() => {
    setRedirectCount(prev => prev + 1);
  }, [location.pathname]);

  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading: authLoading,
    timeoutReached,
    redirectCount
  });

  // PROTEÇÃO ANTI-LOOP: Se muitos redirecionamentos, forçar login
  if (redirectCount > MAX_REDIRECTS) {
    console.error("🔥 [ROOT-REDIRECT] LOOP DETECTADO - Forçando login");
    return <Navigate to="/login" replace />;
  }

  // LOADING NORMAL: Mostrar tela de carregamento (prioridade)
  if (authLoading && !timeoutReached) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // TIMEOUT ATINGIDO OU SEM USUÁRIO: Fallback ABSOLUTO para login
  if (timeoutReached || !user) {
    console.warn(`⚠️ [ROOT-REDIRECT] ${timeoutReached ? 'Timeout' : 'Sem usuário'} - FORÇANDO login`);
    return <Navigate to="/login" replace />;
  }

  // SEM PERFIL: Erro crítico - forçar login imediatamente
  if (!profile) {
    if (authLoading && !timeoutReached) {
      return <LoadingScreen message="Carregando perfil..." />;
    }
    
    console.error("💥 [ROOT-REDIRECT] ERRO CRÍTICO: Usuário sem perfil - FORÇANDO login");
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
