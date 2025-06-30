
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
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
    if (user && (profile || hasCachedAdminAccess || hasCachedFormacaoAccess)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("⚡ [ROOT REDIRECT] Cache/auth válido - timeout cancelado");
      }
    }
  }, [user, profile, hasCachedAdminAccess, hasCachedFormacaoAccess]);
  
  // OTIMIZAÇÃO 4: Navegação rápida com cache apenas para formação
  if (user && hasCachedFormacaoAccess && location.pathname !== '/formacao') {
    console.log("🎯 [ROOT REDIRECT] Cache formação válido - redirecionamento direto");
    return <Navigate to="/formacao" replace />;
  }
  
  // OTIMIZAÇÃO 5: Fallback mais rápido
  if (forceRedirect) {
    console.log("🚨 [ROOT REDIRECT] Circuit breaker ativo - redirecionamento forçado");
    
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      if (roleName === 'formacao') {
        console.log("🎯 [ROOT REDIRECT] Formação no circuit breaker - /formacao");
        return <Navigate to="/formacao" replace />;
      }
      console.log("🎯 [ROOT REDIRECT] Usuário no circuit breaker - /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    console.log("🎯 [ROOT REDIRECT] Sem usuário no circuit breaker - /login");
    return <Navigate to="/login" replace />;
  }
  
  // Se usuário está em /login mas já está autenticado, redirecionar
  if (location.pathname === '/login' && user && profile) {
    console.log("🔄 [ROOT REDIRECT] Usuário autenticado em /login, redirecionando...");
    
    const roleName = getUserRoleName(profile);
    
    if (roleName === 'formacao') {
      console.log("🎯 [ROOT REDIRECT] Formação em /login - redirecionando para /formacao");
      clearTimeout(timeoutRef.current!);
      return <Navigate to="/formacao" replace />;
    }
    
    console.log("🎯 [ROOT REDIRECT] Usuário em /login - redirecionando para /dashboard");
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
  
  // Verificação de roles APÓS verificação básica de usuário
  const roleName = getUserRoleName(profile);
  
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
  
  // Caso padrão: dashboard de membro (MUDANÇA PRINCIPAL)
  console.log("🏠 [ROOT REDIRECT] Redirecionando para dashboard de membro");
  clearTimeout(timeoutRef.current!);
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
