
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";
import { useOnboardingRedirect } from "@/hooks/useOnboardingRedirect";

const RootRedirect = () => {
  const location = useLocation();
  const [forceRedirect, setForceRedirect] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const lastPathRef = useRef<string>('');
  
  // Hook seguro de auth
  const { user, profile, isLoading: authLoading } = useAuth();
  const { redirectToNextStep } = useOnboardingRedirect();
  
  console.log("🔍 [ROOT-REDIRECT] Estado atual:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading: authLoading
  });

  // Circuit breaker para evitar loading infinito - timeout reduzido
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      console.warn("⏰ [ROOT-REDIRECT] Timeout ativado - redirecionamento forçado");
      setForceRedirect(true);
    }, 3000); // Reduzido de 5000 para 3000ms
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Aguardando autenticação
  if (authLoading && !forceRedirect) {
    return <LoadingScreen message="Verificando sua sessão..." />;
  }

  // Sem usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Aguardando perfil
  if (!profile && !forceRedirect) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // Circuit breaker ativo - redirecionamento forçado
  if (forceRedirect) {
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Usuário autenticado em /login deve ser redirecionado
  if (location.pathname === '/login' && user && profile) {
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // VERIFICAÇÃO DO ONBOARDING - Detectar usuários vindos de convite
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    // Verificar se vem de convite (pathname contém 'invite')
    const isFromInvite = location.pathname.includes('/invite/') || location.state?.fromInvite;
    
    // Prevenir loops: só redirecionar se não é a mesma rota
    if (lastPathRef.current !== location.pathname && !hasRedirected) {
      console.log("🔄 [ROOT-REDIRECT] Onboarding obrigatório", isFromInvite ? "(vindo de convite)" : "", "- redirecionando");
      lastPathRef.current = location.pathname;
      setHasRedirected(true);
      
      // Delay maior para usuários vindos de convite para garantir sincronia
      const delay = isFromInvite ? 500 : 100;
      setTimeout(() => {
        redirectToNextStep();
      }, delay);
      
      return <LoadingScreen message={isFromInvite ? "Processando convite..." : "Redirecionando para onboarding..."} />;
    }
    
    // Se já tentou redirecionar mas ainda está aqui, mostrar loading
    if (hasRedirected) {
      return <LoadingScreen message="Processando redirecionamento..." />;
    }
  }
  
  // Se está na página de onboarding mas já completou, redireciona
  if (profile && profile.onboarding_completed && location.pathname.startsWith('/onboarding')) {
    console.log("✅ [ROOT-REDIRECT] Onboarding completo - redirecionando para dashboard");
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // Verificação de roles
  const roleName = getUserRoleName(profile);
  
  // Formação vai direto para área específica
  if (roleName === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Fallback: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
