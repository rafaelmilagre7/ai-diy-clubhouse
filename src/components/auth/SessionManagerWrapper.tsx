
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useSessionManager } from '@/hooks/security/useSessionManager';

/**
 * SessionManagerWrapper - Componente dedicado para gerenciar sessões
 * 
 * SOLUÇÃO PARA DEPENDÊNCIA CIRCULAR:
 * - AuthProvider não chama mais useSessionManager diretamente
 * - Este componente é renderizado APÓS o AuthProvider estar inicializado
 * - Só executa session management quando user e session estão disponíveis
 */
export const SessionManagerWrapper = () => {
  const { user, session } = useAuth();
  const {
    initializeSession,
    updateSessionActivity,
    invalidateAllSessions,
    getUserSessions
  } = useSessionManager();

  // Inicializar session tracking apenas quando autenticado
  useEffect(() => {
    if (user && session) {
      console.log('[SESSION-MANAGER] Inicializando session management para usuário:', user.id);
      initializeSession();
    }
  }, [user, session, initializeSession]);

  // Não renderiza nada - é apenas um componente de lógica
  return null;
};
