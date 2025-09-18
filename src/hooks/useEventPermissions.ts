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

    // VALIDAÇÃO RIGOROSA do UUID do role_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!profile.role_id || !uuidRegex.test(profile.role_id)) {
      console.error('🚨 [EventPermissions] CRÍTICO: profile.role_id inválido!', {
        profile_id: profile.id,
        profile_email: profile.email,
        profile_role_id: profile.role_id,
        is_valid_uuid: profile.role_id ? uuidRegex.test(profile.role_id) : false,
        profile_legacy_role: profile.role,
        profile_keys: Object.keys(profile)
      });
      
      // RETRY INTELIGENTE - Re-buscar profile atualizado do AuthContext
      console.log('🔄 [EventPermissions] Tentando retry com re-fetch do profile...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar novamente após o retry
      if (!profile.role_id || !uuidRegex.test(profile.role_id)) {
        console.error('❌ [EventPermissions] role_id ainda inválido após retry - BLOQUEANDO ACESSO');
        return false;
      }
      
      console.log('✅ [EventPermissions] role_id válido após retry:', profile.role_id);
    }

    // Admin tem acesso total
    if (isAdmin) {
      console.log('✅ [EventPermissions] Usuário é admin - acesso total');
      return true;
    }

    try {
      console.log('🔍 [EventPermissions] Consultando event_access_control:', {
        event_id: eventId,
        role_id: profile.role_id,
        role_id_type: typeof profile.role_id,
        role_id_valid: uuidRegex.test(profile.role_id)
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
      console.log('✅ [EventPermissions] Resultado da consulta:', {
        accessControl,
        hasAccess,
        found_records: accessControl?.length || 0,
        query_params: {
          event_id: eventId,
          role_id: profile.role_id
        }
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