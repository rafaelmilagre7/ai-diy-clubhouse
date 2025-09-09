import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const { profile, isAdmin } = useAuth();

  const checkEventAccess = async (eventId: string): Promise<boolean> => {
    if (!profile?.id) return false;
    
    // Admin sempre tem acesso
    if (isAdmin) return true;

    try {
      // Verificar se o evento tem controle de acesso
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId);

      if (accessError) {
        console.error('Erro ao verificar controle de acesso do evento:', accessError);
        return false;
      }

      // Se não há controle de acesso, evento é público
      if (!accessControl || accessControl.length === 0) {
        return true;
      }

      // Verificar se o role do usuário está na lista de roles permitidos
      const allowedRoleIds = accessControl.map(ac => ac.role_id);
      const userRoleId = profile.role_id;

      return userRoleId ? allowedRoleIds.includes(userRoleId) : false;
    } catch (error) {
      console.error('Erro ao verificar permissões do evento:', error);
      return false;
    }
  };

  const getEventRoleInfo = async (eventId: string) => {
    try {
      const { data: accessControl, error } = await supabase
        .from('event_access_control')
        .select(`
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      return accessControl?.map(ac => ({
        id: ac.role_id,
        name: (ac.user_roles as any)?.name || 'Role desconhecido',
        description: (ac.user_roles as any)?.description
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar informações dos roles do evento:', error);
      return [];
    }
  };

  return {
    checkEventAccess,
    getEventRoleInfo,
    loading
  };
};