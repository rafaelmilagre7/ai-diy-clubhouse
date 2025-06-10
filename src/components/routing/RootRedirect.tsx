
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";
import { navigationCache } from "@/utils/navigationCache";

const RootRedirect = () => {
  const location = useLocation();
  const [forceRedirect, setForceRedirect] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // CORREÇÃO: Verificação segura do contexto
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("[ROOT-REDIRECT] Auth context não disponível:", error);
    return <Navigate to="/login" replace />;
  }

  const { user, profile, isAdmin, isLoading: authLoading } = authContext;
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  // OTIMIZAÇÃO 1: Verificação de cache para navegação rápida
  const hasCachedAdminAccess = user && navigationCache.isAdminVerified(user.id);
  const hasCachedFormacaoAccess = user && navigationCache.isFormacaoVerified(user.id);
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    authLoading,
    hasCachedAdminAccess,
    hasCachedFormacaoAccess,
    forceRedirect
  });
  
  // Verificação imediata de admin baseada em email
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());
  
  // OTIMIZAÇÃO 2: Circuit breaker reduzido para 2 segundos
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      console.warn("⚠️ [ROOT REDIRECT] Circuit breaker ativado (2s), forçando redirecionamento");
      setForceRedirect(true);
    }, 2000); // Reduzido de 4s para 2s
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // OTIMIZAÇÃO 3: Limpeza de timeout para usuários com cache válido
  useEffect(() => {
    if (user && (isAdmin || isAdminByEmail || profile || hasCachedAdminAccess || hasCachedFormacaoAccess)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("⚡ [ROOT REDIRECT] Cache/auth válido - timeout cancelado");
      }
    }
  }, [user, isAdmin, isAdminByEmail, profile, hasCachedAdminAccess, hasCachedFormacaoAccess]);
  
  // OTIMIZAÇÃO 4: Navegação rápida com cache
  if (user && hasCachedAdminAccess && location.pathname !== '/admin') {
    console.log("🎯 [ROOT REDIRECT] Cache admin válido - redirecionamento direto");
    return <Navigate to="/admin" replace />;
  }
  
  if (user && hasCachedFormacaoAccess && location.pathname !== '/formacao') {
    console.log("🎯 [ROOT REDIRECT] Cache formação válido - redirecionamento direto");
    return <Navigate to="/formacao" replace />;
  }
  
  // OTIMIZAÇÃO 5: Fallback mais rápido
  if (forceRedirect) {
    console.log("🚨 [ROOT REDIRECT] Circuit breaker ativo - redirecionamento forçado");
    if (user && (isAdmin || isAdminByEmail)) {
      console.log("🎯 [ROOT REDIRECT] Admin no circuit breaker - /admin");
      return <Navigate to="/admin" replace />;
    }
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      if (roleName === 'formacao') {
        console.log("🎯 [ROOT REDIRECT] Formação no circuit breaker - /formacao");
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
  
  // OTIMIZAÇÃO 6: Loading reduzido para 1.5s máximo
  if (authLoading && !forceRedirect) {
    console.log("[ROOT-REDIRECT] Aguardando autenticação...");
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Verificação de admin ANTES de qualquer outra verificação
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
  
  // Se há usuário mas não há perfil, aguardar menos tempo
  if (!profile && !forceRedirect) {
    console.log("[ROOT-REDIRECT] Usuário sem perfil - aguardando...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Se não há perfil mas circuit breaker está ativo, ir para dashboard
  if (!profile && forceRedirect) {
    console.log("[ROOT-REDIRECT] Circuit breaker + sem perfil - redirecionando para dashboard");
    clearTimeout(timeoutRef.current!);
    return <Navigate to="/dashboard" replace />;
  }
  
  // APENAS para não-admins: verificação rápida de onboarding
  if (onboardingLoading && !forceRedirect) {
    console.log("[ROOT-REDIRECT] Verificando onboarding...");
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // Se precisa de onboarding (apenas para não-admins)
  if (onboardingRequired && !forceRedirect) {
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
