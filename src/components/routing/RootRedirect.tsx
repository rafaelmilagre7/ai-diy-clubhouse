
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const [forceRedirect, setForceRedirect] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Hook de auth otimizado
  const { user, profile, isLoading: authLoading } = useAuth();
  
  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading: authLoading
  });

  // Circuit breaker otimizado
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      console.warn("⏰ [ROOT-REDIRECT] Timeout - forçando redirecionamento");
      setForceRedirect(true);
    }, 2000); // Reduzido para 2s
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (authLoading && !forceRedirect) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // Sem usuário -> login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Aguardando perfil (com timeout)
  if (!profile && !forceRedirect) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Circuit breaker ativo
  if (forceRedirect) {
    if (user && profile) {
      const roleName = getUserRoleName(profile);
      return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Redirecionamento de login para usuários autenticados
  if (location.pathname === '/login' && user && profile) {
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // FLUXO DE ONBOARDING OTIMIZADO
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith('/onboarding')) {
    console.log("🔄 [ROOT-REDIRECT] Onboarding obrigatório");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Onboarding completo - redirecionar
  if (profile && profile.onboarding_completed && location.pathname.startsWith('/onboarding')) {
    console.log("✅ [ROOT-REDIRECT] Onboarding completo - redirecionando");
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // Redirecionamento baseado em role
  const roleName = getUserRoleName(profile);
  
  if (roleName === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Fallback padrão
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
