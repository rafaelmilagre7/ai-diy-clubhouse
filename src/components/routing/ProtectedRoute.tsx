
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const hasAttemptedAuth = useRef(false);
  
  // Debug logs
  console.log("ProtectedRoute:", { 
    user, 
    isAdmin, 
    isLoading, 
    requireAdmin, 
    requiredRole, 
    path: location.pathname,
    hasAttemptedAuth: hasAttemptedAuth.current
  });
  
  // Configurar timeout para não ficar preso em carregamento infinito
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoute: Loading timeout exceeded");
        setLoadingTimeout(true);
        toast.error("Tempo limite de verificação excedido. Redirecionando para login...");
        
        // Força redirecionamento para login após timeout
        window.location.href = '/login';
      }, 5000); // 5 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Marcar tentativa de autenticação para evitar loops
  useEffect(() => {
    if (!isLoading) {
      hasAttemptedAuth.current = true;
    }
  }, [isLoading]);

  // Se estiver carregando, mostra tela de loading (mas só se o timeout não foi excedido)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado após a verificação, redireciona para login
  if (!isLoading && !user && hasAttemptedAuth.current) {
    console.log("ProtectedRoute: No user after auth check, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar com base em requiredRole ou requireAdmin
  if (!isLoading && user && ((requiredRole === 'admin' || requireAdmin) && !isAdmin)) {
    console.log("Usuário não é admin, redirecionando para dashboard");
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado e tem as permissões necessárias, renderiza os filhos
  return <>{children}</>;
};

export default ProtectedRoute;
