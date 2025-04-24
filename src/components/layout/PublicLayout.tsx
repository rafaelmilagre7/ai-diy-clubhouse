
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout - Layout para páginas públicas (login, registro, etc)
 * Redireciona usuários já autenticados para suas respectivas áreas
 */
const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Debug log
  console.log("PublicLayout:", { user: !!user, isAdmin, isLoading });
  
  // Redirecionar usuários autenticados
  useEffect(() => {
    if (user && !isLoading) {
      const destination = isAdmin ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);
  
  // Mostrar tela de carregamento enquanto verifica
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não está autenticado, mostrar conteúdo
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default PublicLayout;
