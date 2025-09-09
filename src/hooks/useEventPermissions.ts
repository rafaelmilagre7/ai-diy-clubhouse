import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const { profile, isAdmin } = useAuth();

  const checkEventAccess = async (eventId: string): Promise<boolean> => {
    if (!profile?.id) {
      console.log('[DEBUG] EventPermissions: Usuário não logado');
      return false;
    }
    
    console.log('[DEBUG] EventPermissions: Verificando acesso para evento', eventId);
    console.log('[DEBUG] EventPermissions: Usuário:', profile.email);
    console.log('[DEBUG] EventPermissions: Role ID do usuário:', profile.role_id);  
    console.log('[DEBUG] EventPermissions: É admin?', isAdmin);
    
    // Admin sempre tem acesso
    if (isAdmin) {
      console.log('[DEBUG] EventPermissions: Admin tem acesso total');
      return true;
    }

    try {
      // Verificar se o evento tem controle de acesso específico
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId);

      if (accessError) {
        console.error('Erro ao verificar controle de acesso do evento:', accessError);
        return false;
      }

      console.log('[DEBUG] EventPermissions: Controle de acesso encontrado:', accessControl);

      // HIERARQUIA DE PERMISSÕES:
      // 1. Se o evento tem controle específico de acesso (event_access_control), isso sobrepõe qualquer permissão geral
      // 2. A permissão geral "events: true" permite navegar na seção, mas não acessar eventos restritos
      
      if (!accessControl || accessControl.length === 0) {
        // Evento SEM controle específico = evento público
        console.log('[DEBUG] EventPermissions: Evento público (sem controle de acesso)');
        return true;
      }

      // Evento COM controle específico = verificar apenas roles permitidos
      const allowedRoleIds = accessControl.map(ac => ac.role_id);
      const userRoleId = profile.role_id;
      
      console.log('[DEBUG] EventPermissions: Roles permitidos:', allowedRoleIds);
      console.log('[DEBUG] EventPermissions: Role do usuário:', userRoleId);
      
      const hasAccess = userRoleId ? allowedRoleIds.includes(userRoleId) : false;
      
      console.log('[DEBUG] EventPermissions: Usuário tem acesso?', hasAccess);
      
      // IMPORTANTE: Aqui NÃO consideramos permissões gerais como "events: true"
      // O controle específico do evento tem precedência absoluta
      return hasAccess;
      
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