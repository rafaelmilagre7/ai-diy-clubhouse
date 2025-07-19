
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

const AuthSession = () => {
  const { isLoading } = useAuth();

  // Componente simplificado - toda lógica está no AuthContext
  if (isLoading) {
    return <LoadingScreen message="Inicializando sessão" showProgress />;
  }
  
  return null;
};

export default AuthSession;
