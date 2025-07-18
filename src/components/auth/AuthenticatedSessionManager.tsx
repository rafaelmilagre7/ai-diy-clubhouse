import { useAuth } from '@/contexts/auth';
import { useSessionManager } from '@/hooks/security/useSessionManager';

/**
 * Componente que gerencia sessões APENAS quando o AuthProvider está pronto
 * Evita o erro "useAuth must be used within an AuthProvider"
 */
export const AuthenticatedSessionManager = () => {
  const { user, session, isLoading } = useAuth();
  
  // Só usar o session manager quando auth estiver pronto e não em loading
  useSessionManager(user, session);
  
  // Este componente não renderiza nada, apenas gerencia sessões
  return null;
};