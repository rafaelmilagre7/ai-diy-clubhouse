
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
  timeoutMs = 2000, // Reduzido para 2 segundos
  showTransitions = false
}) => {
  const { user, profile, isAdmin, isFormacao, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasToastShown = useRef(false);

  console.log("ProtectedRoute:", {
    path: location.pathname,
    requireAuth,
    requireAdmin,
    requireFormacao,
    user: !!user,
    isAdmin,
    isFormacao,
    isLoading,
    loadingTimeout,
    accessChecked
  });

  // Função para verificar acesso
  const checkAccess = (): RouteAccessConfig => {
    if (!requireAuth) {
      return {
        isAuthenticated: true,
        hasRequiredRole: true,
        shouldRedirect: false,
        redirectTarget: ""
      };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        hasRequiredRole: false,
        shouldRedirect: true,
        redirectTarget: fallbackRoute
      };
    }

    let hasRequiredRole = true;

    if (requireAdmin && !isAdmin) {
      hasRequiredRole = false;
    }

    if (requireFormacao && !(isFormacao || isAdmin)) {
      hasRequiredRole = false;
    }

    if (allowedRoles.length > 0 && profile) {
      const userRole = profile.role;
      const hasCustomRole = allowedRoles.includes(userRole) || 
                           (allowedRoles.includes('admin') && isAdmin) ||
                           (allowedRoles.includes('formacao') && isFormacao);
      
      if (!hasCustomRole) {
        hasRequiredRole = false;
      }
    }

    const shouldRedirect = !hasRequiredRole;
    const redirectTarget = shouldRedirect ? 
      (requireAdmin || requireFormacao ? "/dashboard" : fallbackRoute) : "";

    return {
      isAuthenticated: true,
      hasRequiredRole,
      shouldRedirect,
      redirectTarget
    };
  };

  // Timeout mais agressivo
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoute: Loading timeout exceeded");
        setLoadingTimeout(true);
        
        if (!hasToastShown.current) {
          toast.error("Carregamento demorou mais que o esperado");
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

  // Verificar acesso rapidamente
  useEffect(() => {
    if (!isLoading || loadingTimeout) {
      setAccessChecked(true);
    }
  }, [isLoading, loadingTimeout]);

  // Loading mais curto
  if ((isLoading && !loadingTimeout) || !accessChecked) {
    const LoadingComponent = (
      <LoadingScreen message="Verificando acesso..." />
    );

    return showTransitions ? (
      <PageTransitionWithFallback isVisible={true}>
        {LoadingComponent}
      </PageTransitionWithFallback>
    ) : LoadingComponent;
  }

  // Verificar acesso
  const accessConfig = checkAccess();

  if (accessConfig.shouldRedirect) {
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
  const ChildrenComponent = <>{children}</>;

  return showTransitions ? (
    <PageTransitionWithFallback isVisible={true}>
      {ChildrenComponent}
    </PageTransitionWithFallback>
  ) : ChildrenComponent;
};

export default ProtectedRoute;
