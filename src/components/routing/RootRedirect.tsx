
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();

  console.log('🔄 [ROOT-REDIRECT] Avaliando redirecionamento:', {
    pathname: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading: authLoading
  });

  // LOADING: Aguardar autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando sessão..." />;
  }

  // SEM USUÁRIO: Redirecionar para login
  if (!user) {
    console.log('🔒 [ROOT-REDIRECT] Sem usuário, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // SEM PERFIL: Aguardar ou redirecionar para login
  if (!profile) {
    console.log('👤 [ROOT-REDIRECT] Sem perfil, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // USUÁRIO LOGADO EM /login: Redirecionar para dashboard apropriado
  if (location.pathname === '/login' || location.pathname === '/auth') {
    const roleName = getUserRoleName(profile);
    const targetPath = roleName === 'formacao' ? '/formacao' : '/dashboard';
    console.log('🎯 [ROOT-REDIRECT] Usuário logado em página de auth, redirecionando para:', targetPath);
    return <Navigate to={targetPath} replace />;
  }
  
  // REDIRECIONAMENTO POR ROLE na página inicial
  if (location.pathname === '/') {
    const roleName = getUserRoleName(profile);
    const targetPath = roleName === 'formacao' ? '/formacao' : '/dashboard';
    console.log('🏠 [ROOT-REDIRECT] Página inicial, redirecionando para:', targetPath);
    return <Navigate to={targetPath} replace />;
  }
  
  // VERIFICAR E CORRIGIR ROTAS INVÁLIDAS
  if (location.pathname.includes('/83') || location.pathname === '/83' || !location.pathname.startsWith('/')) {
    console.warn('⚠️ [ROOT-REDIRECT] Rota inválida detectada:', location.pathname, '- redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ [ROOT-REDIRECT] Permitindo acesso à rota:', location.pathname);
  // DEIXAR OUTRAS ROTAS PASSAREM
  return null;
};

export default RootRedirect;
