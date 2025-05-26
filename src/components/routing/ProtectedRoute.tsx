
import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { toast } from "sonner";
import type { ProtectedRouteProps, RouteAccessConfig } from "./types/ProtectedRouteTypes";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireFormacao = false,
  allowedRoles = [],
  fallbackRoute = "/login",
  timeoutMs = 1500, // Reduzido ainda mais
  showTransitions = false
}) => {
  const { user, profile, isAdmin, isFormacao, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasToastShown = useRef(false);

  console.log("🔐 ProtectedRoute: Verificando acesso", {
    path: location.pathname,
    requireAuth,
    requireAdmin,
    requireFormacao,
    user: !!user,
    profile: !!profile,
    isAdmin,
    isFormacao,
    isLoading,
    loadingTimeout,
    accessChecked
  });

  // Função para verificar acesso
  const checkAccess = (): RouteAccessConfig => {
    console.log("🔍 ProtectedRoute: Executando checkAccess");
    
    if (!requireAuth) {
      console.log("✅ ProtectedRoute: Rota não requer autenticação");
      return {
        isAuthenticated: true,
        hasRequiredRole: true,
        shouldRedirect: false,
        redirectTarget: ""
      };
    }

    if (!user) {
      console.log("❌ ProtectedRoute: Usuário não autenticado");
      return {
        isAuthenticated: false,
        hasRequiredRole: false,
        shouldRedirect: true,
        redirectTarget: fallbackRoute
      };
    }

    let hasRequiredRole = true;

    if (requireAdmin && !isAdmin) {
      console.log("❌ ProtectedRoute: Requer admin mas usuário não é admin");
      hasRequiredRole = false;
    }

    if (requireFormacao && !(isFormacao || isAdmin)) {
      console.log("❌ ProtectedRoute: Requer formação mas usuário não tem acesso");
      hasRequiredRole = false;
    }

    if (allowedRoles.length > 0 && profile) {
      const userRole = profile.role;
      const hasCustomRole = allowedRoles.includes(userRole) || 
                           (allowedRoles.includes('admin') && isAdmin) ||
                           (allowedRoles.includes('formacao') && isFormacao);
      
      if (!hasCustomRole) {
        console.log("❌ ProtectedRoute: Usuário não tem role necessário");
        hasRequiredRole = false;
      }
    }

    const shouldRedirect = !hasRequiredRole;
    const redirectTarget = shouldRedirect ? 
      (requireAdmin || requireFormacao ? "/dashboard" : fallbackRoute) : "";

    console.log("✅ ProtectedRoute: Verificação de acesso concluída", {
      hasRequiredRole,
      shouldRedirect,
      redirectTarget
    });

    return {
      isAuthenticated: true,
      hasRequiredRole,
      shouldRedirect,
      redirectTarget
    };
  };

  // Timeout mais otimizado
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("⏰ ProtectedRoute: Timeout de carregamento atingido");
        setLoadingTimeout(true);
        
        if (!hasToastShown.current) {
          toast.warning("Carregamento está demorando mais que o esperado");
          hasToastShown.current = true;
        }
      }, timeoutMs);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout, timeoutMs]);

  // Verificar acesso mais rapidamente
  useEffect(() => {
    if (!isLoading || loadingTimeout) {
      console.log("✅ ProtectedRoute: Marcando acesso como verificado");
      setAccessChecked(true);
    }
  }, [isLoading, loadingTimeout]);

  // Loading otimizado
  if ((isLoading && !loadingTimeout) || !accessChecked) {
    console.log("⏳ ProtectedRoute: Mostrando tela de carregamento");
    
    const LoadingComponent = (
      <LoadingScreen message="Verificando acesso..." />
    );

    return showTransitions ? (
      <PageTransitionWithFallback isVisible={true}>
        {LoadingComponent}
      </PageTransitionWithFallback>
    ) : LoadingComponent;
  }

  // Verificar acesso final
  const accessConfig = checkAccess();

  if (accessConfig.shouldRedirect) {
    console.log("🔀 ProtectedRoute: Redirecionando", accessConfig.redirectTarget);
    
    if (!hasToastShown.current) {
      if (!accessConfig.isAuthenticated) {
        toast.error("Por favor, faça login para acessar esta página");
      } else if (requireAdmin) {
        toast.error("Você não tem permissão para acessar a área administrativa");
      } else if (requireFormacao) {
        toast.error("Você não tem permissão para acessar a área de formação");
      } else {
        toast.error("Você não tem permissão para acessar esta área");
      }
      hasToastShown.current = true;
    }

    const returnPath = location.pathname !== fallbackRoute ? location.pathname : "/dashboard";
    
    return (
      <Navigate 
        to={accessConfig.redirectTarget} 
        state={{ from: returnPath }} 
        replace 
      />
    );
  }

  // Renderizar children
  console.log("✅ ProtectedRoute: Renderizando children");
  const ChildrenComponent = <>{children}</>;

  return showTransitions ? (
    <PageTransitionWithFallback isVisible={true}>
      {ChildrenComponent}
    </PageTransitionWithFallback>
  ) : ChildrenComponent;
};

export default ProtectedRoute;
