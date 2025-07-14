
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
  
  // Log simplificado apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log("[ROOT-REDIRECT]", {
      path: location.pathname,
      hasUser: !!user,
      hasProfile: !!profile,
      loading: authLoading
    });
  }
  
  // Circuit breaker para evitar loading infinito
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setForceRedirect(true);
    }, 3000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Limpar timeout quando auth está pronto
  useEffect(() => {
    if (user && (profile || hasCachedAdminAccess || hasCachedFormacaoAccess)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [user, profile, hasCachedAdminAccess, hasCachedFormacaoAccess]);
  
  // Navegação rápida com cache para formação
  if (user && hasCachedFormacaoAccess && location.pathname !== '/formacao') {
    return <Navigate to="/formacao" replace />;
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
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
  
  // VERIFICAÇÃO DO ONBOARDING - Prioridade máxima
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    console.log("[ROOT-REDIRECT] Redirecionando para onboarding - usuário não completou");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Redirecionar para a nova estrutura de etapas
    return <Navigate to="/onboarding/step/1" replace />;
  }
  
  // Se está na página de onboarding mas já completou, redireciona
  if (profile && profile.onboarding_completed && location.pathname.startsWith('/onboarding')) {
    console.log("[ROOT-REDIRECT] Usuário já completou onboarding, redirecionando para dashboard");
    const roleName = getUserRoleName(profile);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // Verificação de roles
  const roleName = getUserRoleName(profile);
  
  // Formação vai direto para área específica
  if (roleName === 'formacao') {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return <Navigate to="/formacao" replace />;
  }
  
  // Aguardando perfil
  if (!profile && !forceRedirect) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Fallback: dashboard
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
