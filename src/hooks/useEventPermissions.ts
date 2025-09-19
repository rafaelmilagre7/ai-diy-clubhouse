import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';

export const useEventPermissions = () => {
  const { profile, isLoading } = useAuth();

  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    console.log('✅ [EventPermissions] Acesso liberado para todos os eventos:', {
      eventId: eventId?.substring(0, 8) + '***'
    });

    // Verificações básicas
    if (isLoading) {
      console.log('⏳ [EventPermissions] Auth ainda carregando');
      return false;
    }
    
    if (!eventId) {
      console.log('❌ [EventPermissions] EventId não fornecido');
      return false;
    }
    
    if (!profile) {
      console.log('❌ [EventPermissions] Profile não existe');
      return false;
    }

    // Acesso liberado para todos os usuários autenticados
    console.log('✅ [EventPermissions] Acesso total liberado');
    return true;
  }, [profile, isLoading]);

  // Função auxiliar para obter informações dos roles permitidos (sempre vazia agora)
  const getEventRoleInfo = useCallback(async (eventId: string) => {
    console.log('✅ [EventPermissions] Roles não são mais verificados - retornando array vazio');
    return [];
  }, []);

  return {
    checkEventAccess,
    getEventRoleInfo,
    loading: false
  };
};