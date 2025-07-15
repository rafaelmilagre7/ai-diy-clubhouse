
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";
import { navigationCache } from "@/utils/navigationCache";
import { supabase } from "@/integrations/supabase/client";

const RootRedirect = () => {
  const location = useLocation();
  const [forceRedirect, setForceRedirect] = useState(false);
  const [onboardingRedirectUrl, setOnboardingRedirectUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // CORREÇÃO: Sempre chamar o hook, tratar erro via state
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("[ROOT-REDIRECT] Auth context não disponível:", error);
    authContext = { user: null, profile: null, isAdmin: false, isLoading: false };
    if (!authError) setAuthError(true);
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
  
  // Tratar erro de autenticação primeiro
  if (authError) {
    return <Navigate to="/login" replace />;
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
  
  // useEffect para determinar redirecionamento de onboarding
  useEffect(() => {
    const determineOnboardingStep = async () => {
      if (!user?.id || !profile || profile.onboarding_completed || location.pathname.startsWith('/onboarding')) {
        return;
      }

      console.log("[ROOT-REDIRECT] Determinando próximo passo do onboarding");
      
      try {
        const { data, error } = await supabase.rpc('get_onboarding_next_step', {
          p_user_id: user.id
        });

        if (!error && data?.redirect_url) {
          setOnboardingRedirectUrl(data.redirect_url);
        } else {
          setOnboardingRedirectUrl('/onboarding/step/1');
        }
      } catch (error) {
        console.error("[ROOT-REDIRECT] Erro ao determinar step:", error);
        setOnboardingRedirectUrl('/onboarding/step/1');
      }
    };
    
    determineOnboardingStep();
  }, [user?.id, profile?.onboarding_completed, location.pathname]);

  // VERIFICAÇÃO DO ONBOARDING - Usar função centralizada
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    console.log("[ROOT-REDIRECT] ONBOARDING OBRIGATÓRIO - Redirecionando usuário");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (onboardingRedirectUrl) {
      return <Navigate to={onboardingRedirectUrl} replace />;
    }
    
    return <LoadingScreen message="Determinando próximo passo..." />;
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
