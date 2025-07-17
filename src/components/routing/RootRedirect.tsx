
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
  
  // TIMEOUT DE SEGURANÇA: Se ficar carregando muito tempo, forçar redirecionamento
  useEffect(() => {
    if (authLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("⏰ [ROOT-REDIRECT] Timeout de loading atingido - forçando redirecionamento");
        setTimeoutReached(true);
      }, 5000); // 5 segundos máximo
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

  // TIMEOUT ATINGIDO: Redirecionar para login
  if (timeoutReached && !user) {
    console.warn("⚠️ [ROOT-REDIRECT] Timeout - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // LOADING NORMAL: Mostrar tela de carregamento
  if (authLoading && !timeoutReached) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // SEM USUÁRIO: Redirecionar para login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // SEM PERFIL: Aguardar um pouco mais ou mostrar erro
  if (!profile) {
    if (authLoading) {
      return <LoadingScreen message="Carregando perfil..." />;
    }
    
    console.error("💥 [ROOT-REDIRECT] ERRO: Usuário sem perfil após loading");
    return <LoadingScreen message="Erro: Perfil não encontrado. Tente fazer login novamente." />;
  }

  // USUÁRIO LOGADO EM /login: Redirecionar para dashboard apropriado
  if (location.pathname === '/login') {
    const roleName = getUserRoleName(profile);
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para dashboard");
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // ONBOARDING OBRIGATÓRIO
  if (!profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    console.log("🔄 [ROOT-REDIRECT] Onboarding obrigatório");
    return <Navigate to="/onboarding" replace />;
  }
  
  // ONBOARDING COMPLETO em rota de onboarding
  if (profile.onboarding_completed && location.pathname.startsWith('/onboarding')) {
    console.log("✅ [ROOT-REDIRECT] Onboarding já completo - redirecionando");
    const roleName = getUserRoleName(profile);
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
