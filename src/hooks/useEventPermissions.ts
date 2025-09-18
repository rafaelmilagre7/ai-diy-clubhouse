import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const { profile, isAdmin, isLoading } = useAuth();

  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    console.log('🔍 [EventPermissions] Iniciando verificação de acesso:', {
      eventId: eventId?.substring(0, 8) + '***',
      isLoading,
      profile_exists: !!profile,
      profile_role_id: profile?.role_id,
      isAdmin,
      user_id: profile?.id?.substring(0, 8) + '***'
    });

    // Verificações básicas
    if (isLoading) {
      console.log('❌ [EventPermissions] Auth ainda carregando');
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

    if (!profile.role_id) {
      console.error('❌ [EventPermissions] CRÍTICO: profile.role_id está NULL/undefined!', {
        profile_id: profile.id,
        profile_email: profile.email,
        profile_role_id: profile.role_id,
        profile_legacy_role: profile.role,
        profile_keys: Object.keys(profile)
      });
      
      // Fallback: aguardar um pouco e tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!profile.role_id) {
        console.error('❌ [EventPermissions] role_id ainda NULL após retry');
        return false;
      }
    }

    // Admin tem acesso total
    if (isAdmin) {
      console.log('✅ [EventPermissions] Usuário é admin - acesso total');
      return true;
    }

    try {
      console.log('🔍 [EventPermissions] Consultando event_access_control:', {
        event_id: eventId,
        role_id: profile.role_id
      });

      const { data: accessControl, error } = await supabase
        .from('event_access_control')
        .select('role_id')
        .eq('event_id', eventId)
        .eq('role_id', profile.role_id)
        .limit(1);

      if (error) {
        console.error('❌ [EventPermissions] Erro ao verificar acesso:', error);
        return false;
      }

      const hasAccess = accessControl && accessControl.length > 0;
      console.log('🔍 [EventPermissions] Resultado da consulta:', {
        accessControl,
        hasAccess,
        found_records: accessControl?.length || 0
      });

      return hasAccess;
    } catch (error) {
      console.error('❌ [EventPermissions] Erro na consulta:', error);
      return false;
    }
  }, [profile, isLoading, isAdmin]);

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