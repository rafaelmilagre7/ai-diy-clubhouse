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
        eventExists: !!eventData,
        eventTitle: eventData?.title,
        eventError: eventError
      });

      // 4. Verificar controle de acesso
      const { data: accessControl, error: accessError } = await supabase
        .from('event_access_control')
        .select(`
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `)
        .eq('event_id', eventId);

      console.log('🔐 CONTROLE DE ACESSO:', {
        accessControlExists: !!accessControl,
        accessControlCount: accessControl?.length || 0,
        allowedRoleIds: accessControl?.map(ac => ac.role_id) || [],
        allowedRoleNames: accessControl?.map(ac => (ac.user_roles as any)?.name) || [],
        userRoleId: profile.role_id,
        userRoleInList: accessControl?.some(ac => ac.role_id === profile.role_id),
        accessError: accessError
      });

      // 5. Simular verificação real
      const hasAccess = isAdmin || (accessControl && accessControl.length > 0 && accessControl.some(ac => ac.role_id === profile.role_id));
      
      console.log('✅ RESULTADO FINAL:', {
        hasAccess,
        reason: hasAccess ? 
          (isAdmin ? 'admin_access' : 'role_in_allowed_list') : 
          (!accessControl || accessControl.length === 0 ? 'no_access_control' : 'role_not_in_allowed_list'),
        recommendation: hasAccess ? 'Acesso liberado' : 'Verificar se o usuário deveria ter acesso'
      });

      console.groupEnd();
      
      return { 
        hasAccess, 
        reason: hasAccess ? 'access_granted' : 'access_denied',
        details: {
          userRole: userRole?.name,
          allowedRoles: accessControl?.map(ac => (ac.user_roles as any)?.name) || [],
          eventTitle: eventData?.title
        }
      };

    } catch (debugError) {
      console.error('💥 ERRO NO DEBUG:', debugError);
      console.groupEnd();
      return { hasAccess: false, reason: 'debug_error', error: debugError };
    }
  }, [profile, isAdmin]);

  // FASE 2: Retry automático com backoff
  const checkEventAccessWithRetry = useCallback(async (eventId: string, attempt = 1): Promise<boolean> => {
    const maxRetries = 3;
    const backoffDelay = attempt * 1000; // 1s, 2s, 3s

    try {
      return await checkEventAccess(eventId);
    } catch (error) {
      warn(`Tentativa ${attempt} falhou:`, error);
      
      if (attempt < maxRetries) {
        warn(`Tentando novamente em ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return checkEventAccessWithRetry(eventId, attempt + 1);
      }
      
      error('Todas as tentativas falharam:', error);
      return false;
    }
  }, []);

  // FASE 4: Função para forçar re-verificação
  const forceRefreshPermissions = useCallback(async (eventId: string) => {
    log('🔄 Forçando re-verificação de permissões');
    setRetryCount(prev => prev + 1);
    setLoading(true);
    
    try {
      // Limpar possível cache do Supabase
      const result = await checkEventAccessWithRetry(eventId);
      log('✅ Re-verificação concluída:', result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [checkEventAccessWithRetry, log]);

  // VERSÃO CORRIGIDA - Mais restritiva e segura
  const checkEventAccess = useCallback(async (eventId: string): Promise<boolean> => {
    // PRINCÍPIO: NEGADO POR PADRÃO, LIBERADO APENAS EXPLICITAMENTE
    let hasAccess = false;
    
    const debugInfo = {
      eventId,
      userId: profile?.id,
      userEmail: profile?.email,
      userRoleId: profile?.role_id,
      isAdmin,
      timestamp: new Date().toISOString()
    };

    // 1. VALIDAÇÕES BÁSICAS - ACESSO NEGADO SE FALHAR
    if (!profile?.id) {
      console.log('[🔒 EventPermissions] ACESSO NEGADO - Usuário não logado', debugInfo);
      return false;
    }

    if (!eventId || eventId.trim() === '') {
      console.log('[🔒 EventPermissions] ACESSO NEGADO - EventId inválido', debugInfo);
      return false;
    }
    
    console.log('[🔍 EventPermissions] INICIANDO verificação de acesso', debugInfo);
    
    // 2. VALIDAÇÃO DE INTEGRIDADE DO USUÁRIO
    if (!profile.role_id) {
      console.error('[🔒 EventPermissions] ACESSO NEGADO - Usuário sem role_id definido', debugInfo);
      return false; // MUDANÇA: Antes era warning, agora é NEGAÇÃO
    }
    
    // 3. ADMIN TEM ACESSO (ÚNICO CASO DE BYPASS)
    if (isAdmin) {
      console.log('[✅ EventPermissions] ACESSO LIBERADO - Admin tem acesso total', debugInfo);
      return true;
    }

    try {
      // Buscar informações completas do evento e controle de acesso
      const [eventResult, accessResult, userRoleResult] = await Promise.all([
        supabase.from('events').select('title, created_by').eq('id', eventId).single(),
        supabase.from('event_access_control').select(`
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `).eq('event_id', eventId),
        profile.role_id ? supabase.from('user_roles').select('name, description').eq('id', profile.role_id).single() : null
      ]);

      const eventInfo = eventResult.data;
      const accessControl = accessResult.data;
      const userRole = userRoleResult?.data;

      const enhancedDebugInfo = {
        ...debugInfo,
        eventTitle: eventInfo?.title || 'Evento não encontrado',
        eventCreatedBy: eventInfo?.created_by,
        userRoleName: userRole?.name || 'Role não encontrado',
        accessControlCount: accessControl?.length || 0,
        allowedRoles: accessControl?.map(ac => (ac.user_roles as any)?.name) || []
      };

      if (eventResult.error || !eventInfo) {
        console.error('[❌ EventPermissions] ERRO - Evento não encontrado', enhancedDebugInfo);
        return false;
      }

      if (accessResult.error) {
        console.error('[❌ EventPermissions] ERRO - Falha ao verificar controle de acesso', {
          ...enhancedDebugInfo,
          error: accessResult.error
        });
        return false;
      }

      console.log('[📊 EventPermissions] DADOS COLETADOS', enhancedDebugInfo);

      // 4. VALIDAÇÃO CRÍTICA DE INTEGRIDADE
      if (profile.role_id && !userRole) {
        console.error('[🚨 EventPermissions] ACESSO NEGADO - Role do usuário não existe no banco', {
          ...enhancedDebugInfo,
          issue: 'user_role_not_found'
        });
        return false; // MUDANÇA: Antes continuava, agora NEGA acesso
      }
      
      // 5. LÓGICA PRINCIPAL DE CONTROLE DE ACESSO
      // MUDANÇA CRÍTICA: EVENTO SEM CONTROLE = ACESSO NEGADO (não público)
      if (!accessControl || accessControl.length === 0) {
        console.log('[🔒 EventPermissions] ACESSO NEGADO - Evento sem controle de acesso configurado', {
          ...enhancedDebugInfo,
          securityNote: 'Por segurança, eventos sem controle explícito são privados'
        });
        return false; // MUDANÇA: Antes retornava true, agora false
      }

      // 6. VERIFICAÇÃO ESTRITA DE ROLES PERMITIDOS
      const allowedRoleIds = accessControl.map(ac => ac.role_id).filter(id => id); // Remove nulls
      const userRoleId = profile.role_id;
      
      if (!userRoleId) {
        console.log('[🔒 EventPermissions] ACESSO NEGADO - Usuário sem role válido', enhancedDebugInfo);
        return false;
      }
      
      hasAccess = allowedRoleIds.includes(userRoleId);
      
      const finalDebugInfo = {
        ...enhancedDebugInfo,
        allowedRoleIds,
        userRoleId,
        userHasAccess: hasAccess,
        reason: hasAccess ? 'user_role_in_allowed_list' : 'user_role_not_in_allowed_list',
        securityCheck: 'STRICT_MODE_ENABLED'
      };
      
      if (hasAccess) {
        console.log('[✅ EventPermissions] ACESSO LIBERADO - Usuário tem role permitido', finalDebugInfo);
        
        // Log de auditoria para acessos liberados
        console.info('[📋 EventPermissions] AUDITORIA - Acesso autorizado', {
          ...finalDebugInfo,
          auditNote: 'Acesso liberado com base em role válido'
        });
      } else {
        console.log('[🔒 EventPermissions] ACESSO NEGADO - Role do usuário não está na lista permitida', finalDebugInfo);
        
        // Log adicional de auditoria para acesso negado
        console.warn('[📋 EventPermissions] AUDITORIA - Tentativa de acesso bloqueada', {
          ...finalDebugInfo,
          suggestedAction: 'Verificar se o usuário deveria ter acesso a este evento',
          userRoleFound: userRole?.name || 'Não encontrado',
          expectedRoles: accessControl.map(ac => (ac.user_roles as any)?.name).join(', ')
        });
      }
      
      return hasAccess;
      
    } catch (error) {
      console.error('[💥 EventPermissions] ERRO CRÍTICO - Falha na verificação de permissões', {
        ...debugInfo,
        error: error instanceof Error ? error.message : error,
        securityNote: 'Erro crítico resulta em ACESSO NEGADO por segurança'
      });
      
      // Em caso de erro, SEMPRE negar acesso por segurança
      return false;
    }
  }, [profile?.id, profile?.email, profile?.role_id, isAdmin]);

  // FASE 1: Estabilizar função com useCallback 
  const getEventRoleInfo = useCallback(async (eventId: string) => {
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
  }, []); // Sem dependências pois usa apenas Supabase

  return {
    checkEventAccess,
    checkEventAccessWithRetry,
    getEventRoleInfo,
    debugEventAccess,
    forceRefreshPermissions,
    loading,
    retryCount
  };
};