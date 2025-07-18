
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState, useRef } from "react";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  console.log("🔄 [ROOT-REDIRECT] RENDER SIMPLIFICADO:", {
    path: location.pathname,
    hasUser: !!user,
    authLoading,
    timestamp: new Date().toISOString()
  });

  // APENAS REDIRECIONAMENTOS ESSENCIAIS - SEM LOOPS
  
  // Se carregando, mostrar loading apenas por 2 segundos (sincronizado)
  if (authLoading) {
    console.log("⏳ [ROOT-REDIRECT] Carregando...");
    setTimeout(() => {
      console.warn("⚠️ [ROOT-REDIRECT] Timeout de loading - continuando sem auth");
    }, 2000);
    return <LoadingScreen message="Carregando..." />;
  }

  // APENAS redirecionamentos da página inicial e login quando logado
  if (location.pathname === '/' && user) {
    const roleName = getUserRoleName(profile);
    console.log(`🎯 [ROOT-REDIRECT] Página inicial - redirecionando para: ${roleName === 'formacao' ? '/formacao' : '/dashboard'}`);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // Usuário logado tentando acessar /login - APENAS se tiver perfil válido
  if (location.pathname === '/login' && user && profile) {
    const roleName = getUserRoleName(profile);
    console.log("✅ [ROOT-REDIRECT] Usuário logado com perfil em /login - redirecionando");
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // PARA TODAS AS OUTRAS ROTAS: DEIXAR OS COMPONENTES PROTEGIDOS LIDAREM
  console.log("✅ [ROOT-REDIRECT] Deixando rota passar para componentes protegidos");
  return null;
};

export default RootRedirect;
