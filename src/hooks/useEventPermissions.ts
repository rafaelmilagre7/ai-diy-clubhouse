import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useOptimizedLogging } from '@/hooks/useOptimizedLogging';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { profile, isAdmin } = useAuth();
  const { log, warn, error } = useOptimizedLogging();

  // FASE 3: Função de Debug em Tempo Real
  const debugEventAccess = useCallback(async (eventId: string) => {
    const timestamp = new Date().toISOString();
    
    console.group(`🔍 [DEBUG EventPermissions] Diagnóstico Completo - ${timestamp}`);
    
    // 1. Estado do usuário atual
    console.log('👤 ESTADO DO USUÁRIO:', {
      profileExists: !!profile,
      userId: profile?.id,
      userEmail: profile?.email,
      roleId: profile?.role_id,
      isAdmin,
      profileComplete: profile && profile.id && profile.email && profile.role_id
    });

    if (!profile?.id) {
      console.warn('❌ PROBLEMA: Usuário não está logado');
      console.groupEnd();
      return { hasAccess: false, reason: 'user_not_logged_in' };
    }

    // 2. Verificar role do usuário no banco
    try {
      const { data: userRole, error: userRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();

      console.log('👥 ROLE DO USUÁRIO:', {
        roleId: profile.role_id,
        roleData: userRole,
        roleError: userRoleError
      });

      // 3. Verificar evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      console.log('📅 DADOS DO EVENTO:', {
        eventId,
        eventData,
        eventError
      });

      // 4. Verificar controle de acesso
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select(`
          id,
          event_id,
          role_id,
          user_roles:role_id (
            id,
            name,
            description
          )
        `)
        .eq('event_id', eventId);

      console.log('🔐 CONTROLE DE ACESSO:', {
        eventId,
        accessControl,
        accessError,
        accessControlCount: accessControl?.length || 0
      });

      // 5. Resultado da verificação
      const access = await checkEventAccess(eventId);
      
      console.log('🎯 RESULTADO FINAL:', {
        hasAccess: access,
        userRoleId: profile.role_id,
        userRoleName: userRole?.name,
        allowedRoles: accessControl?.map(ac => (ac.user_roles as any)?.name) || [],
        isAdmin
      });

      console.groupEnd();
      return { hasAccess: access, debugData: { userRole, eventData, accessControl } };

    } catch (error) {
      console.error('💥 ERRO NO DEBUG:', error);
      console.groupEnd();
      return { hasAccess: false, error };
    }
  }, [profile, isAdmin]);

  // FASE 2: Função de Refresh Manual
  const forceRefreshPermissions = useCallback(() => {
    console.log('🔄 [EventPermissions] Forçando refresh manual das permissões');
    setRetryCount(prev => prev + 1);
  }, []);

  // FASE 1: Verificação Principal com Cache Busting
  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    const timestamp = Date.now();
    console.log('🔍 [EventPermissions] INICIANDO VERIFICAÇÃO FRESCA:', { eventId, timestamp });
    
    try {
      // 1. VERIFICAÇÃO DE ADMIN - ACESSO TOTAL
      if (isAdmin) {
        console.log('🔓 [EventPermissions] LIBERADO - Usuário é ADMIN');
        return true;
      }

      // 2. VERIFICAÇÃO DO PROFILE COMPLETO
      if (!profile?.id || !profile?.role_id) {
        console.log('❌ [EventPermissions] NEGADO - Profile incompleto', {
          hasProfile: !!profile,
          hasId: !!profile?.id,
          hasRoleId: !!profile?.role_id,
          profile: profile ? {
            id: profile.id.substring(0, 8) + '***',
            email: profile.email,
            roleId: profile.role_id
          } : null
        });
        return false;
      }
      
      // 3. CONSULTA FRESCA DO CONTROLE DE ACESSO (CACHE BUSTING)
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select(`
          id,
          event_id,
          role_id,
          created_at,
          user_roles:role_id (
            id,
            name,
            description
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (accessError) {
        console.error('❌ [EventPermissions] Erro ao consultar controle de acesso:', accessError);
        return false;
      }

      const enhancedDebugInfo = {
        eventId,
        userId: profile.id.substring(0, 8) + '***',
        userEmail: profile.email,
        userRoleId: profile.role_id,
        isAdmin,
        accessControlCount: accessControl?.length || 0,
        accessControl: accessControl?.map(ac => ({
          id: ac.id,
          roleId: ac.role_id,
          roleName: (ac.user_roles as any)?.name
        })),
        timestamp,
        cacheStatus: 'FRESH_QUERY'
      };

      console.log('🔍 [EventPermissions] DADOS FRESCOS OBTIDOS:', enhancedDebugInfo);
      
      // 4. VERIFICAÇÃO DO CONTROLE DE ACESSO
      if (!accessControl || accessControl.length === 0) {
        console.log('🔒 [EventPermissions] NEGADO - Evento privado (sem permissões configuradas)', enhancedDebugInfo);
        return false;
      }

      // 5. VERIFICAÇÃO DE ROLES PERMITIDOS
      const allowedRoleIds = accessControl
        .map(ac => ac.role_id)
        .filter(id => id !== null && id !== undefined)
        .map(id => String(id));
      
      const userRoleId = String(profile.role_id);
      
      console.log('🔍 [EventPermissions] COMPARAÇÃO DE ROLES FRESCA:', {
        userRoleId,
        allowedRoleIds,
        userRoleType: typeof userRoleId,
        allowedRoleTypes: allowedRoleIds.map(id => typeof id),
        includes: allowedRoleIds.includes(userRoleId),
        timestamp
      });
      
      const hasAccess = allowedRoleIds.includes(userRoleId);
      
      const finalDebugInfo = {
        ...enhancedDebugInfo,
        allowedRoleIds,
        userRoleId,
        userHasAccess: hasAccess,
        reason: hasAccess ? 'user_role_in_allowed_list' : 'user_role_not_in_allowed_list',
        comparisonDetails: {
          userRoleIdString: String(userRoleId),
          allowedRoleIdsStrings: allowedRoleIds,
          exactMatch: allowedRoleIds.find(id => id === String(userRoleId)),
          includes: allowedRoleIds.includes(String(userRoleId))
        }
      };

      console.log(hasAccess ? '✅ [EventPermissions] ACESSO LIBERADO' : '❌ [EventPermissions] ACESSO NEGADO', finalDebugInfo);
      return hasAccess;

    } catch (error) {
      console.error('💥 [EventPermissions] ERRO CRÍTICO na verificação:', error);
      return false;
    }
  }, [profile, isAdmin, retryCount]); // Adicionado retryCount para forçar re-execução

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
    debugEventAccess,
    forceRefreshPermissions,
    loading,
    retryCount
  };
};