
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: true, // Onboarding removido
    loading: authLoading
  });

  // Loading direto - sem timeouts
  if (authLoading) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // Sem usuário = login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Sem perfil = erro crítico
  if (!profile) {
    console.error("💥 [ROOT-REDIRECT] ERRO CRÍTICO: Usuário sem perfil");
    throw new Error(`Usuário ${user.id} não possui perfil. Estado de auth corrompido.`);
  }

  // Redirecionamento de login para usuários autenticados
  if (location.pathname === '/login') {
    const roleName = getUserRoleName(profile);
    console.log("✅ [ROOT-REDIRECT] Usuário logado, redirecionando para dashboard");
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // Onboarding removido - redirecionar para dashboard se estiver na rota de onboarding
  if (location.pathname.startsWith('/onboarding')) {
    console.log("✅ [ROOT-REDIRECT] Onboarding completo - redirecionando");
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // Redirecionamento baseado em role
  const roleName = getUserRoleName(profile);
  
  if (roleName === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão: dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
