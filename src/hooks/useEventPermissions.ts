import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useOptimizedLogging } from '@/hooks/useOptimizedLogging';

export const useEventPermissions = () => {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { profile, isAdmin, isLoading } = useAuth();
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

  // FASE 1: Verificação Principal com Cache Busting e Validação ROBUSTA
  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    const timestamp = Date.now();
    
    // DIAGNÓSTICO ULTRA-DETALHADO - LOGS COMPLETOS
    console.group('🔍 [EVENT ACCESS] INÍCIO DA VERIFICAÇÃO');
    console.log('📋 Parâmetros de entrada:', { eventId, timestamp: new Date().toISOString() });
    
    console.log('👤 Estado do PROFILE completo:', {
      profile: profile,
      profileExists: !!profile,
      profileId: profile?.id,
      profileEmail: profile?.email,
      profileRoleId: profile?.role_id,
      profileRoleIdType: typeof profile?.role_id,
      profileRoleIdRaw: JSON.stringify(profile?.role_id),
      profileKeys: profile ? Object.keys(profile) : 'no-profile',
      isLoading,
      isAdmin
    });
    
    // VERIFICAÇÃO DE CONSISTÊNCIA do profile
    if (profile) {
      console.log('🔬 ANÁLISE DETALHADA do profile.role_id:', {
        value: profile.role_id,
        type: typeof profile.role_id,
        stringified: JSON.stringify(profile.role_id),
        toString: String(profile.role_id),
        isNull: profile.role_id === null,
        isUndefined: profile.role_id === undefined,
        isEmpty: profile.role_id === '',
        length: profile.role_id ? String(profile.role_id).length : 0
      });
    }

    // VERIFICAÇÃO ROBUSTA E RETRY AUTOMÁTICO
    if (isLoading) {
      console.log('🟡 [EVENT ACCESS] Auth ainda carregando, negando temporariamente');
      console.groupEnd();
      return false;
    }

    if (!eventId) {
      console.log('🚫 [EVENT ACCESS] eventId ausente:', eventId);
      console.groupEnd();
      return false;
    }

    if (!profile) {
      console.log('🚫 [EVENT ACCESS] Profile não carregado - tentando aguardar...');
      
      // RETRY AUTOMÁTICO: Aguardar um pouco e tentar novamente
      if (retryCount < 3) {
        console.log('⏳ Tentando aguardar profile carregar... (tentativa ' + (retryCount + 1) + '/3)');
        setTimeout(() => setRetryCount(prev => prev + 1), 1000);
        console.groupEnd();
        return false;
      } else {
        console.log('❌ Profile definitivamente não disponível após 3 tentativas');
        console.groupEnd();
        return false;
      }
    }

    if (!profile.role_id) {
      console.log('🚫 [EVENT ACCESS] Profile existe mas role_id ausente!', {
        profileCompleto: JSON.stringify(profile, null, 2),
        roleIdValue: profile.role_id,
        roleIdType: typeof profile.role_id
      });
      console.groupEnd();
      return false;
    }

    // VERIFICAÇÃO DE FORMATO UUID
    const roleIdStr = String(profile.role_id).trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(roleIdStr)) {
      console.error('🚫 [EVENT ACCESS] Invalid UUID format for role_id:', {
        roleId: roleIdStr,
        originalValue: profile.role_id,
        type: typeof profile.role_id
      });
      return false;
    }
    
    try {
      // 1. VERIFICAÇÃO DE ADMIN - ACESSO TOTAL
      if (isAdmin) {
        console.log('🔓 [EVENT ACCESS] LIBERADO - Usuário é ADMIN');
        return true;
      }
      
      // 2. CONSULTA FRESCA DO CONTROLE DE ACESSO (CACHE BUSTING)
      console.log('🔍 [EVENT ACCESS] Checking access for:', { 
        eventId, 
        userRoleId: roleIdStr,
        userEmail: profile?.email 
      });

      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select(`
          role_id,
          user_roles!inner(
            id,
            name,
            description
          )
        `)
        .eq('event_id', eventId)
        .eq('role_id', roleIdStr)
        .limit(1);

      console.log('📊 [EVENT ACCESS DEBUG] Query response:', {
        data: accessControl,
        error: accessError,
        queryParams: { eventId, roleId: roleIdStr },
        timestamp: new Date().toISOString()
      });

      if (accessError) {
        console.error('❌ [EVENT ACCESS] Error checking access:', accessError);
        return false;
      }

      const hasAccess = accessControl && accessControl.length > 0;
      
      console.log('✅ [EVENT ACCESS] RESULTADO FINAL:', {
        hasAccess,
        accessControlCount: accessControl?.length || 0,
        accessControlData: accessControl,
        eventId,
        userRole: roleIdStr,
        userEmail: profile?.email,
        detailedCheck: {
          queryFound: !!accessControl,
          arrayLength: Array.isArray(accessControl) ? accessControl.length : 'not array',
          firstItem: accessControl?.[0] || 'none',
          isAccessControlTruthy: !!accessControl,
          isLengthGreaterThanZero: accessControl ? accessControl.length > 0 : false
        }
      });
      
      console.groupEnd();
      return hasAccess;

    } catch (error) {
      console.error('❌ [EVENT ACCESS] EXCEÇÃO CAPTURADA:', error);
      console.groupEnd();
      return false;
    }
  }, [profile, isLoading, isAdmin, retryCount]); // Adicionado isLoading para aguardar profile

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