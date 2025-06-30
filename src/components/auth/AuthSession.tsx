
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

const AuthSession = () => {
  const { isLoading } = useAuth();

  // CORREÇÃO: Remover chamada duplicada de setupAuthSession
  // O AuthContext já gerencia toda a lógica de autenticação
  // Este componente agora apenas mostra loading se necessário
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return null;
};

export default AuthSession;
