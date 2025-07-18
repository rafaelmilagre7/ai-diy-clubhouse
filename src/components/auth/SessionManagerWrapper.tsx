
import { useAuth } from '@/contexts/auth';
import { useSessionManager } from '@/hooks/security/useSessionManager';

/**
 * Componente que gerencia sessões APÓS a autenticação estar pronta
 * Evita dependência circular no AuthProvider
 */
export const SessionManagerWrapper = () => {
  const { user, session } = useAuth();
  
  // Usar o session manager apenas quando auth estiver pronto
  useSessionManager(user, session);
  
  // Este componente não renderiza nada, apenas gerencia sessões
  return null;
};
