
import { ReactNode } from "react";
import Layout from "./Layout";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  console.log("LayoutProvider renderizando:", {
    user: !!user,
    isLoading,
    path: window.location.pathname,
    url: window.location.href
  });

  // Se estiver carregando, mostrar tela de carregamento
  if (isLoading) {
    console.log("LayoutProvider: Carregando...");
    return <LoadingScreen message="Carregando seu conteúdo..." />;
  }

  // Se não houver usuário, redirecionar para a página de login
  if (!user) {
    console.log("LayoutProvider: Usuário não autenticado, redirecionando para login");
    toast("Por favor, faça login para acessar esta página");
    navigate("/login", { replace: true });
    return <LoadingScreen message="Redirecionando para login..." />;
  }

  console.log("LayoutProvider: Renderizando layout normal");
  
  // Se houver usuário, renderizar o layout com o conteúdo
  return <Layout>{children}</Layout>;
};

export default LayoutProvider;
