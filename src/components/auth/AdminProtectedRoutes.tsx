
import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

/**
 * AdminProtectedRoutes protege rotas que requerem privilégios de administrador
 */
const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [forceTimeout, setForceTimeout] = useState(false);

  // TIMEOUT SINCRONIZADO DE 2 SEGUNDOS  
  useEffect(() => {
    console.log("🔒 [ADMIN-PROTECTED] Configurando timeout sincronizado de 2s");
    const timeout = setTimeout(() => {
      console.error("🚨 [ADMIN-PROTECTED] TIMEOUT SINCRONIZADO - Forçando decisão");
      setForceTimeout(true);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Se timeout forçado E ainda carregando, redirecionar para login
  if (forceTimeout && isLoading) {
    console.error("🚨 [ADMIN-PROTECTED] Timeout forçado - redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se ainda carregando e sem timeout, mostrar loading
  if (isLoading && !forceTimeout) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  // SEMPRE redirecionar usuários não autenticados para login
  if (!user) {
    console.log("⚠️ [ADMIN-PROTECTED] Usuário não autenticado - redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // SEMPRE redirecionar usuários não-admin para login (não dashboard)
  if (!isAdmin) {
    console.log("⚠️ [ADMIN-PROTECTED] Usuário não é admin - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ [ADMIN-PROTECTED] Acesso concedido ao admin");
  return <>{children}</>;
};

export default AdminProtectedRoutes;
