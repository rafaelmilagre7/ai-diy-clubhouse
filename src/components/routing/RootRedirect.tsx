
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useState, useEffect, useRef } from "react";

const RootRedirect = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout>();
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    redirectPath
  });

  useEffect(() => {
    // Limpar timer anterior
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }

    // Aguardar carregamento completo com timeout
    if (authLoading || onboardingLoading) {
      // Timeout de segurança - máximo 5 segundos
      redirectTimerRef.current = setTimeout(() => {
        console.log("[ROOT-REDIRECT] Timeout de segurança atingido");
        if (!user) {
          setRedirectPath("/login");
        } else {
          setRedirectPath("/dashboard");
        }
      }, 5000);
      return;
    }

    // Lógica de redirecionamento simplificada
    if (!user) {
      console.log("[ROOT-REDIRECT] Sem usuário -> login");
      setRedirectPath("/login");
      return;
    }
    
    if (user && !profile) {
      console.log("[ROOT-REDIRECT] Aguardando perfil...");
      // Timeout menor para perfil
      redirectTimerRef.current = setTimeout(() => {
        setRedirectPath("/dashboard"); // Fallback
      }, 3000);
      return;
    }
    
    if (onboardingRequired) {
      console.log("[ROOT-REDIRECT] Onboarding necessário");
      setRedirectPath("/onboarding");
      return;
    }
    
    // Determinar dashboard baseado no perfil
    const userRole = profile?.user_roles?.name;
    if (userRole === 'formacao') {
      console.log("[ROOT-REDIRECT] Usuário formação -> /formacao");
      setRedirectPath("/formacao");
    } else {
      console.log("[ROOT-REDIRECT] Dashboard padrão");
      setRedirectPath("/dashboard");
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired]);

  // Mostrar loading enquanto determina redirecionamento
  if (!redirectPath) {
    return <LoadingScreen message="Verificando seu acesso..." />;
  }

  // Executar redirecionamento
  return <Navigate to={redirectPath} replace />;
};

export default RootRedirect;
