
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  console.log("🚀 LayoutProvider: Iniciando");
  
  const {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading: authLoading,
  } = useOptimizedAuth();
  
  console.log("🔐 LayoutProvider: Estado de auth", {
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    isFormacao,
    authLoading
  });
  
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  console.log("📍 LayoutProvider: Rota atual", location.pathname);
  console.log("✅ LayoutProvider: Onboarding complete", isOnboardingComplete, "loading:", onboardingLoading);

  // Memoizar verificações de rota
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao'),
    isOnboardingRoute: location.pathname.startsWith('/onboarding')
  }), [location.pathname]);

  console.log("🛣️ LayoutProvider: Verificações de rota", routeChecks);

  // Memoizar mensagem de loading
  const loadingMessage = useMemo(() => {
    if (authLoading) return "Preparando seu dashboard...";
    if (onboardingLoading) return "Verificando onboarding...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [authLoading, onboardingLoading, user]);

  // Verificar autenticação
  useEffect(() => {
    console.log("🔄 LayoutProvider: useEffect principal executando", {
      authLoading,
      onboardingLoading,
      hasUser: !!user,
      currentPath: location.pathname
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!authLoading && !onboardingLoading) {
      console.log("✅ LayoutProvider: Loading concluído, verificando usuário");
      
      if (!user) {
        console.log("❌ LayoutProvider: Sem usuário, redirecionando para login");
        navigate('/login', { replace: true });
        return;
      }
      
      if (!routeChecks.isOnboardingRoute && !isOnboardingComplete) {
        console.log("❌ LayoutProvider: Onboarding incompleto, redirecionando");
        navigate('/onboarding-new', { replace: true });
        return;
      }
      
      console.log("✅ LayoutProvider: Tudo OK, layout pronto");
      setLayoutReady(true);
      
      // Verificar redirecionamento por role
      if (user && profile) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        console.log("👤 LayoutProvider: Verificando redirecionamento por role", {
          userRole: profile.role,
          isAdmin,
          isFormacao,
          currentRoute: location.pathname
        });
        
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          console.log("🔄 LayoutProvider: Admin redirecionando para /admin");
          navigate('/admin', { replace: true });
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          console.log("🔄 LayoutProvider: Formacao redirecionando para /formacao");
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      console.log("⏳ LayoutProvider: Ainda carregando, configurando timeout");
      timeoutRef.current = window.setTimeout(() => {
        console.log("⏰ LayoutProvider: Timeout atingido, forçando layout ready");
        setLayoutReady(true);
      }, 2000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, profile, isAdmin, isFormacao, authLoading, onboardingLoading, isOnboardingComplete, navigate, routeChecks]);

  console.log("🎯 LayoutProvider: Estado final", { layoutReady, hasUser: !!user });

  // Renderizar layout baseado na rota
  if (layoutReady && user) {
    const { isFormacaoRoute, isLearningRoute } = routeChecks;
    
    console.log("🎨 LayoutProvider: Renderizando layout", { isFormacaoRoute, isLearningRoute });
    
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      console.log("📚 LayoutProvider: Renderizando FormacaoLayout");
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } else if (isLearningRoute || !isFormacao || isAdmin) {
      console.log("👥 LayoutProvider: Renderizando MemberLayout");
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>{children}</MemberLayout>
        </PageTransitionWithFallback>
      );
    }
  }

  console.log("⏳ LayoutProvider: Mostrando LoadingScreen", { message: loadingMessage });
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
