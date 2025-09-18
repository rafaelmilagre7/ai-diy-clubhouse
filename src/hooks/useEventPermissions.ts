import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const { profile, isAdmin, isLoading } = useAuth();

  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    // Verificações básicas
    if (isLoading) return false;
    if (!eventId) return false;
    if (!profile?.role_id) return false;

    // Admin tem acesso total
    if (isAdmin) return true;

    try {
      const { data: accessControl, error } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId)
        .eq('role_id', profile.role_id)
        .limit(1);

      if (error) {
        console.error('[EventPermissions] Erro ao verificar acesso:', error);
        return false;
      }

      return accessControl && accessControl.length > 0;
    } catch (error) {
      console.error('[EventPermissions] Erro:', error);
      return false;
    }
  }, [profile?.role_id, isLoading, isAdmin]);

  // Função auxiliar para obter informações dos roles permitidos
  const getEventRoleInfo = useCallback(async (eventId: string) => {
    try {
      const { data: accessControl, error } = await supabase
        .from('event_access_control')
        .select(`
          role_id,
          user_roles:role_id (
            id,
            name,
            description
          )
        `)
        .eq('event_id', eventId);

      if (error) {
        console.error('❌ [EventPermissions] Erro ao buscar roles do evento:', error);
        return [];
      }

      return accessControl?.map(ac => ({
        id: (ac.user_roles as any)?.id || '',
        name: (ac.user_roles as any)?.name || 'Role não encontrado',
        description: (ac.user_roles as any)?.description
      })) || [];
    } catch (error) {
      console.error('❌ [EventPermissions] Erro ao buscar roles:', error);
      return [];
    }
  }, []);

  return {
    checkEventAccess,
    getEventRoleInfo,
    loading
  };
};