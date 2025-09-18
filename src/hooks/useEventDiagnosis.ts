import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useOptimizedLogging } from '@/hooks/useOptimizedLogging';

/**
 * Hook especializado para diagnóstico avançado de problemas de acesso a eventos
 * FASE 3: Ferramenta de debug completa
 */
export const useEventDiagnosis = () => {
  const { profile, isAdmin } = useAuth();
  const { log, warn, error } = useOptimizedLogging();

  const runFullDiagnosis = useCallback(async (eventId: string) => {
    const timestamp = new Date().toISOString();
    
    console.group(`🏥 [DIAGNÓSTICO COMPLETO] Evento ${eventId} - ${timestamp}`);
    
    const diagnosticResults = {
      timestamp,
      eventId,
      user: {
        isLoggedIn: !!profile?.id,
        userId: profile?.id,
        email: profile?.email,
        roleId: profile?.role_id,
        isAdmin,
        profileComplete: !!(profile?.id && profile?.email && profile?.role_id)
      },
      event: null as any,
      userRole: null as any,
      accessControl: null as any,
      permissions: {
        hasAccess: false,
        reason: 'unknown',
        details: {}
      },
      recommendations: [] as string[],
      criticalIssues: [] as string[]
    };

    try {
      // 1. VERIFICAÇÃO DO USUÁRIO
      console.log('👤 [STEP 1] Verificando estado do usuário...');
      
      if (!profile?.id) {
        diagnosticResults.criticalIssues.push('Usuário não está logado');
        console.error('❌ CRÍTICO: Usuário não logado');
      } else if (!profile.role_id) {
        diagnosticResults.criticalIssues.push('Usuário sem role_id definido');
        console.error('❌ CRÍTICO: Usuário sem role');
      } else {
        console.log('✅ Usuário logado com role válido');
      }

      // 2. VERIFICAÇÃO DO ROLE DO USUÁRIO
      if (profile?.role_id) {
        console.log('👥 [STEP 2] Verificando role do usuário...');
        
        const { data: userRole, error: userRoleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('id', profile.role_id)
          .single();

        diagnosticResults.userRole = userRole;
        
        if (userRoleError || !userRole) {
          diagnosticResults.criticalIssues.push(`Role ID ${profile.role_id} não existe no banco`);
          console.error('❌ CRÍTICO: Role não encontrado', userRoleError);
        } else {
          console.log('✅ Role encontrado:', userRole.name);
        }
      }

      // 3. VERIFICAÇÃO DO EVENTO
      console.log('📅 [STEP 3] Verificando evento...');
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      diagnosticResults.event = eventData;
      
      if (eventError || !eventData) {
        diagnosticResults.criticalIssues.push('Evento não encontrado');
        console.error('❌ CRÍTICO: Evento não existe', eventError);
      } else {
        console.log('✅ Evento encontrado:', eventData.title);
      }

      // 4. VERIFICAÇÃO DO CONTROLE DE ACESSO
      console.log('🔐 [STEP 4] Verificando controle de acesso...');
      
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

      diagnosticResults.accessControl = accessControl;
      
      if (accessError) {
        diagnosticResults.criticalIssues.push('Erro ao verificar controle de acesso');
        console.error('❌ CRÍTICO: Erro no controle de acesso', accessError);
      } else if (!accessControl || accessControl.length === 0) {
        diagnosticResults.criticalIssues.push('Evento sem controle de acesso configurado');
        console.warn('⚠️ ATENÇÃO: Evento sem controle de acesso');
      } else {
        console.log('✅ Controle de acesso encontrado:', accessControl.length, 'roles permitidos');
      }

      // 5. ANÁLISE FINAL
      console.log('🎯 [STEP 5] Análise final...');
      
      let hasAccess = false;
      let reason = 'access_denied';
      
      if (isAdmin) {
        hasAccess = true;
        reason = 'admin_access';
      } else if (accessControl && accessControl.length > 0 && profile?.role_id) {
        hasAccess = accessControl.some(ac => ac.role_id === profile.role_id);
        reason = hasAccess ? 'role_in_allowed_list' : 'role_not_in_allowed_list';
      }
      
      diagnosticResults.permissions = {
        hasAccess,
        reason,
        details: {
          userRoleName: diagnosticResults.userRole?.name,
          allowedRoles: accessControl?.map(ac => (ac.user_roles as any)?.name) || [],
          totalAllowedRoles: accessControl?.length || 0
        }
      };

      // 6. RECOMENDAÇÕES
      if (diagnosticResults.criticalIssues.length === 0) {
        if (!hasAccess) {
          diagnosticResults.recommendations.push('Verificar se o usuário deveria ter acesso a este evento');
          diagnosticResults.recommendations.push('Considerar adicionar o role do usuário ao controle de acesso');
        }
      } else {
        diagnosticResults.recommendations.push('Corrigir os problemas críticos identificados primeiro');
      }

      // 7. RELATÓRIO FINAL
      console.log('📊 [RESULTADO FINAL]');
      console.log('Acesso:', hasAccess ? '✅ LIBERADO' : '❌ NEGADO');
      console.log('Motivo:', reason);
      console.log('Problemas críticos:', diagnosticResults.criticalIssues.length);
      console.log('Recomendações:', diagnosticResults.recommendations.length);
      
      if (diagnosticResults.criticalIssues.length > 0) {
        console.error('🚨 PROBLEMAS CRÍTICOS:', diagnosticResults.criticalIssues);
      }
      
      if (diagnosticResults.recommendations.length > 0) {
        console.warn('💡 RECOMENDAÇÕES:', diagnosticResults.recommendations);
      }

      console.groupEnd();
      
      return diagnosticResults;

    } catch (diagnosisError) {
      console.error('💥 ERRO CRÍTICO NO DIAGNÓSTICO:', diagnosisError);
      diagnosticResults.criticalIssues.push('Erro inesperado durante diagnóstico');
      console.groupEnd();
      
      return diagnosticResults;
    }
  }, [profile, isAdmin, log, warn, error]);

  const quickHealthCheck = useCallback(async (eventId: string) => {
    console.log('⚡ [QUICK CHECK] Verificação rápida...');
    
    const checks = {
      userLoggedIn: !!profile?.id,
      userHasRole: !!profile?.role_id,
      isAdmin,
      eventId: !!eventId
    };
    
    const healthScore = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;
    
    console.log('📊 Health Score:', `${healthScore}/${maxScore}`);
    console.log('🔍 Checks:', checks);
    
    return {
      healthScore,
      maxScore,
      isHealthy: healthScore === maxScore,
      checks
    };
  }, [profile, isAdmin]);

  return {
    runFullDiagnosis,
    quickHealthCheck
  };
};