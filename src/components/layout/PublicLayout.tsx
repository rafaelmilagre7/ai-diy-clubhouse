
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar usuários autenticados
  React.useEffect(() => {
    if (user && !isLoading) {
      const destination = user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, isLoading, navigate]);
  
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
