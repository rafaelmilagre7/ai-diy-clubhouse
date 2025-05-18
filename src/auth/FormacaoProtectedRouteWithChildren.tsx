
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface FormacaoProtectedRouteWithChildrenProps {
  children: React.ReactNode;
}

export const FormacaoProtectedRouteWithChildren = ({ children }: FormacaoProtectedRouteWithChildrenProps) => {
  const { user, isAdmin, isFormacao, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  console.log("FormacaoProtectedRouteWithChildren state:", { user, isAdmin, isFormacao, isLoading, loadingTimeout });
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("FormacaoProtectedRouteWithChildren: Loading timeout exceeded");
        setLoadingTimeout(true);
      }, 5000); // 5 segundos para maior tolerância
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação (mas apenas se o timeout não foi excedido)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando permissões de acesso..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    toast.error("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário não for admin ou formacao, redireciona para o dashboard
  if (!(isAdmin || isFormacao)) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário é admin ou formacao, renderiza os filhos
  return <>{children}</>;
};
