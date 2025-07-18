
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();

  // LOADING: Aguardar autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // SEM USUÁRIO: Redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SEM PERFIL: Aguardar ou redirecionar para login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // USUÁRIO LOGADO EM /login: Redirecionar para dashboard apropriado
  if (location.pathname === '/login' || location.pathname === '/auth') {
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // REDIRECIONAMENTO POR ROLE na página inicial
  if (location.pathname === '/') {
    const roleName = getUserRoleName(profile);
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }
  
  // DEIXAR OUTRAS ROTAS PASSAREM
  return null;
};

export default RootRedirect;
