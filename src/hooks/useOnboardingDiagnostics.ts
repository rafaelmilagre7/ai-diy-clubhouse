
import { useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

export const useOnboardingDiagnostics = () => {
  const { user, profile } = useSimpleAuth();

  useEffect(() => {
    const runDiagnostics = async () => {
      if (!user) return;

      try {
        logger.info('[ONBOARDING-DIAGNOSTICS] Executando diagnóstico completo:', {
          userId: user.id.substring(0, 8) + '***',
          email: user.email,
          hasProfile: !!profile
        });

        // 1. Verificar dados do perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          logger.error('[ONBOARDING-DIAGNOSTICS] Erro ao buscar perfil:', profileError);
        } else {
          logger.info('[ONBOARDING-DIAGNOSTICS] Dados do perfil:', {
            id: profileData.id.substring(0, 8) + '***',
            email: profileData.email,
            name: profileData.name,
            role: profileData.role,
            roleId: profileData.role_id,
            onboardingCompleted: profileData.onboarding_completed,
            onboardingCompletedAt: profileData.onboarding_completed_at,
            createdAt: profileData.created_at
          });
        }

        // 2. Verificar role
        if (profileData?.role_id) {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('id', profileData.role_id)
            .single();

          if (roleError) {
            logger.error('[ONBOARDING-DIAGNOSTICS] Erro ao buscar role:', roleError);
          } else {
            logger.info('[ONBOARDING-DIAGNOSTICS] Dados da role:', {
              id: roleData.id,
              name: roleData.name,
              description: roleData.description,
              isSystem: roleData.is_system
            });
          }
        }

        // 3. Testar acesso a solutions (limitado)
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, title, is_published')
          .limit(1);

        logger.info('[ONBOARDING-DIAGNOSTICS] Teste de acesso a solutions:', {
          success: !solutionsError,
          error: solutionsError?.message,
          dataCount: solutionsData?.length || 0
        });

        // 4. Testar acesso a tools (limitado)
        const { data: toolsData, error: toolsError } = await supabase
          .from('tools')
          .select('id, name, is_active')
          .limit(1);

        logger.info('[ONBOARDING-DIAGNOSTICS] Teste de acesso a tools:', {
          success: !toolsError,
          error: toolsError?.message,
          dataCount: toolsData?.length || 0
        });

        // 5. Verificar audit logs recentes
        const { data: auditData, error: auditError } = await supabase
          .from('audit_logs')
          .select('event_type, action, details, timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(5);

        logger.info('[ONBOARDING-DIAGNOSTICS] Audit logs recentes:', {
          success: !auditError,
          error: auditError?.message,
          logsCount: auditData?.length || 0,
          recentActions: auditData?.map(log => log.action) || []
        });

      } catch (error) {
        logger.error('[ONBOARDING-DIAGNOSTICS] Erro no diagnóstico:', error);
      }
    };

    // Executar diagnóstico após 1 segundo para permitir carregamento do perfil
    const timer = setTimeout(runDiagnostics, 1000);
    return () => clearTimeout(timer);
  }, [user, profile]);
};
