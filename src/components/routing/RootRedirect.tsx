
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef, useCallback } from "react";
import { getUserRoleName } from "@/lib/supabase/types";
import { navigationCache } from "@/utils/navigationCache";

const RootRedirect = () => {
  const location = useLocation();
  const [forceRedirect, setForceRedirect] = useState(false);
  const [adaptiveTimeout, setAdaptiveTimeout] = useState(8000); // CORREÇÃO: Aumentado de 3000 para 8000
  const timeoutRef = useRef<number | null>(null);
  const redirectProcessed = useRef(false);
  
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
  
  // CORREÇÃO: Cache formação verificado
  const hasCachedFormacaoAccess = user && navigationCache.isFormacaoVerified(user.id);
  
  // CORREÇÃO: Detectar performance da conexão para timeout adaptativo
  const detectConnectionSpeed = useCallback(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setAdaptiveTimeout(12000); // CORREÇÃO: Aumentado para 12 segundos
      } else if (effectiveType === '3g') {
        setAdaptiveTimeout(10000); // CORREÇÃO: Aumentado para 10 segundos
      } else {
        setAdaptiveTimeout(8000); // CORREÇÃO: Padrão 8 segundos
      }
    }
  }, []);

  // CORREÇÃO: Detectar usuários de convite
  const isFromInvite = user?.user_metadata?.from_invite;
  
  console.log("[ROOT-REDIRECT] Estado atualizado:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    authLoading,
    onboardingRequired,
    onboardingLoading,
    isFromInvite,
    hasCachedFormacaoAccess,
    forceRedirect,
    adaptiveTimeout
  });
  
  // CORREÇÃO: Circuit breaker adaptativo com timeouts maiores e mais seguros
  useEffect(() => {
    detectConnectionSpeed();
    
    timeoutRef.current = window.setTimeout(() => {
      console.warn(`⚠️ [ROOT REDIRECT] Circuit breaker ativado (${adaptiveTimeout}ms), forçando redirecionamento`);
      setForceRedirect(true);
    }, adaptiveTimeout);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [adaptiveTimeout, detectConnectionSpeed]);
  
  // CORREÇÃO: Limpeza de timeout mais inteligente
  useEffect(() => {
    if (user && (profile || hasCachedFormacaoAccess)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("⚡ [ROOT REDIRECT] Cache/auth válido - timeout cancelado");
      }
    }
  }, [user, profile, hasCachedFormacaoAccess]);
  
  // CORREÇÃO: Navegação instantânea com cache
  const handleCachedRedirect = useCallback((path: string, reason: string) => {
    if (redirectProcessed.current) return null;
    redirectProcessed.current = true;
    console.log(`🚀 [ROOT REDIRECT] ${reason} - redirecionamento instantâneo para ${path}`);
    return <Navigate to={path} replace />;
  }, []);

  if (user && hasCachedFormacaoAccess && location.pathname !== '/formacao') {
    return handleCachedRedirect('/formacao', 'Cache formação válido');
  }
  
  // CORREÇÃO: Fallback mais seguro com redirecionamento inteligente
  if (forceRedirect) {
    console.log("🚨 [ROOT REDIRECT] Circuit breaker ativo - redirecionamento forçado");
    
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      if (roleName === 'formacao') {
        return handleCachedRedirect('/formacao', 'Formação no circuit breaker');
      }
      // CORREÇÃO: Admin também vai para dashboard membro
      return handleCachedRedirect('/dashboard', 'Usuário/Admin no circuit breaker');
    }
    return handleCachedRedirect('/login', 'Sem usuário no circuit breaker');
  }
  
  // CORREÇÃO: Redirecionamento direto para usuários já autenticados em /login
  if (location.pathname === '/login' && user && profile) {
    console.log("🔄 [ROOT REDIRECT] Usuário autenticado em /login, redirecionando...");
    
    const roleName = getUserRoleName(profile);
    
    if (roleName === 'formacao') {
      return handleCachedRedirect('/formacao', 'Formação em /login');
    }
    
    // CORREÇÃO: Admin também vai para dashboard membro
    return handleCachedRedirect('/dashboard', 'Usuário/Admin em /login');
  }
  
  // CORREÇÃO: Loading otimizado com timeouts maiores e mais seguros
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
  
  // CORREÇÃO: Redirecionamento direto com cache
  if (roleName === 'formacao') {
    navigationCache.set(user.id, profile, 'formacao');
    return handleCachedRedirect('/formacao', 'Formação detectado');
  }
  
  // CORREÇÃO: Admin não tem redirecionamento especial - vai para dashboard membro
  if (roleName === 'admin') {
    console.log("[ROOT-REDIRECT] Admin detectado - direcionando para dashboard membro");
  }
  
  // Se há usuário mas não há perfil, aguardar mais tempo
  if (!profile && !forceRedirect) {
    console.log("[ROOT-REDIRECT] Usuário sem perfil - aguardando...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Se não há perfil mas circuit breaker está ativo, ir para dashboard
  if (!profile && forceRedirect) {
    return handleCachedRedirect('/dashboard', 'Circuit breaker + sem perfil');
  }
  
  // CORREÇÃO: Verificação de onboarding otimizada
  if (onboardingLoading && !forceRedirect) {
    console.log("[ROOT-REDIRECT] Verificando onboarding...");
    return <LoadingScreen message="Verificando seu progresso..." />;
  }
  
  // CORREÇÃO: Priorizar onboarding para usuários de convite
  if (isFromInvite && onboardingRequired && !forceRedirect) {
    return handleCachedRedirect('/onboarding', 'Usuário de convite precisa de onboarding');
  }
  
  // Se precisa de onboarding
  if (onboardingRequired && !forceRedirect) {
    return handleCachedRedirect('/onboarding', 'Onboarding necessário');
  }
  
  // CORREÇÃO: Caso padrão sempre vai para dashboard membro (incluindo admin)
  return handleCachedRedirect('/dashboard', 'Redirecionamento padrão para dashboard membro');
};

export default RootRedirect;
