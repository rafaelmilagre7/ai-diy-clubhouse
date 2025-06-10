
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const [forceRedirect, setForceRedirect] = useState(false);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const location = useLocation();
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    forceRedirect,
    circuitBreakerActive
  });
  
  // CORREÇÃO 1: Verificação imediata de admin baseada em email
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());
  
  // CORREÇÃO 2: Circuit breaker - timeout reduzido para 6 segundos
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      console.warn("⚠️ [ROOT REDIRECT] Circuit breaker ativado (6s), forçando redirecionamento");
      setCircuitBreakerActive(true);
      setForceRedirect(true);
    }, 6000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // CORREÇÃO 3: Lógica de redirecionamento mais robusta
  useEffect(() => {
    // Se temos informações suficientes para redirecionar, limpar timeout
    if (user && (isAdmin || isAdminByEmail || profile)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [user, isAdmin, isAdminByEmail, profile]);
  
  // CORREÇÃO 4: Fallback mais agressivo por circuit breaker
  if (forceRedirect || circuitBreakerActive) {
    console.log("🚨 [ROOT REDIRECT] Circuit breaker ativo - redirecionamento forçado");
    if (user && (isAdmin || isAdminByEmail)) {
      console.log("🎯 [ROOT REDIRECT] Admin detectado no circuit breaker - /admin");
      return <Navigate to="/admin" replace />;
    }
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      if (roleName === 'formacao') {
        console.log("🎯 [ROOT REDIRECT] Formação detectado no circuit breaker - /formacao");
        return <Navigate to="/formacao" replace />;
      }
      console.log("🎯 [ROOT REDIRECT] Usuário comum no circuit breaker - /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    console.log("🎯 [ROOT REDIRECT] Sem usuário no circuit breaker - /login");
    return <Navigate to="/login" replace />;
  }
  
  // Se usuário está em /login mas já está autenticado, redirecionar
  if (location.pathname === '/login' && user && profile) {
    console.log("🔄 [ROOT REDIRECT] Usuário autenticado em /login, redirecionando...");
    
    const roleName = getUserRoleName(profile);
    
    if (isAdmin || isAdminByEmail || roleName === 'admin') {
      console.log("🎯 [ROOT REDIRECT] Admin em /login - redirecionando para /admin");
      clearTimeout(timeoutRef.current!);
      return <Navigate to="/admin" replace />;
    }
    
    if (roleName === 'formacao') {
      console.log("🎯 [ROOT REDIRECT] Formação em /login - redirecionando para /formacao");
      clearTimeout(timeoutRef.current!);
      return <Navigate to="/formacao" replace />;
    }
    
    console.log("🎯 [ROOT REDIRECT] Usuário comum em /login - redirecionando para /dashboard");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se ainda está carregando autenticação (mas não por muito tempo)
  if (authLoading && !circuitBreakerActive) {
    console.log("[ROOT-REDIRECT] Aguardando autenticação...");
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // CORREÇÃO 5: Verificação de admin ANTES de qualquer outra verificação
  const roleName = getUserRoleName(profile);
  
  // Se é admin (por email OU por role), ir direto para área administrativa
  if (isAdmin || isAdminByEmail || roleName === 'admin') {
    console.log("🎯 [ROOT REDIRECT] Admin detectado - redirecionando para /admin");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/admin" replace />;
  }
  
  // Se é formação, ir direto para área de formação
  if (roleName === 'formacao') {
    console.log("🎯 [ROOT REDIRECT] Formação detectado - redirecionando para /formacao");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/formacao" replace />;
  }
  
  // Se há usuário mas não há perfil, aguardar um pouco mais ou ir para dashboard
  if (!profile && !circuitBreakerActive) {
    console.log("[ROOT-REDIRECT] Usuário sem perfil - aguardando...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Se não há perfil mas circuit breaker está ativo, ir para dashboard
  if (!profile && circuitBreakerActive) {
    console.log("[ROOT-REDIRECT] Circuit breaker + sem perfil - redirecionando para dashboard");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/dashboard" replace />;
  }
  
  // APENAS para não-admins: verificar onboarding
  if (onboardingLoading && !circuitBreakerActive) {
    console.log("[ROOT-REDIRECT] Verificando onboarding...");
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding (apenas para não-admins)
  if (onboardingRequired && !circuitBreakerActive) {
    console.log("📝 [ROOT REDIRECT] Onboarding necessário - redirecionando para /onboarding");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/onboarding" replace />;
  }
  
  // Caso padrão: dashboard
  console.log("🏠 [ROOT REDIRECT] Redirecionando para dashboard");
  clearTimeout(timeoutRef.current!);
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
