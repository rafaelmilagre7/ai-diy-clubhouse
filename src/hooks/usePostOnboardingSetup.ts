import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para configuração pós-onboarding
 * Garante que o usuário tenha acesso completo após concluir o onboarding
 */
export const usePostOnboardingSetup = () => {
  
  const setupUserAccess = useCallback(async (userId: string) => {
    try {
      console.log('🔧 [POST-ONBOARDING] Configurando acesso do usuário:', userId);
      
      // Verificar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            permissions,
            description
          )
        `)
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('❌ [POST-ONBOARDING] Erro ao buscar perfil:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.error('❌ [POST-ONBOARDING] Perfil não encontrado');
        throw new Error('Perfil não encontrado');
      }
      
      console.log('✅ [POST-ONBOARDING] Perfil encontrado:', {
        role: profile.user_roles?.name,
        onboarding_completed: profile.onboarding_completed
      });
      
      // Verificar se o usuário tem role válido
      if (!profile.user_roles) {
        console.warn('⚠️ [POST-ONBOARDING] Usuário sem role, atribuindo role padrão');
        
        // Buscar role padrão
        const { data: defaultRole, error: roleError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', 'member')
          .single();
        
        if (!roleError && defaultRole) {
          await supabase
            .from('profiles')
            .update({ role_id: defaultRole.id })
            .eq('id', userId);
          
          console.log('✅ [POST-ONBOARDING] Role padrão atribuído');
        }
      }
      
      // Verificar se onboarding foi marcado como completo
      if (!profile.onboarding_completed) {
        console.warn('⚠️ [POST-ONBOARDING] Onboarding não marcado como completo, corrigindo');
        
        await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        console.log('✅ [POST-ONBOARDING] Onboarding marcado como completo');
      }
      
      // Registrar telemetria de acesso configurado
      await supabase.from('analytics').insert({
        user_id: userId,
        event_type: 'post_onboarding_setup_completed',
        event_data: {
          role: profile.user_roles?.name,
          has_complete_profile: !!profile.name && !!profile.email,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('✅ [POST-ONBOARDING] Configuração de acesso concluída');
      
      return {
        success: true,
        profile: profile,
        hasCompleteAccess: true
      };
      
    } catch (error) {
      console.error('❌ [POST-ONBOARDING] Erro na configuração:', error);
      
      toast({
        title: "Aviso",
        description: "Houve um problema na configuração do seu acesso. Entre em contato com o suporte se necessário.",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error
      };
    }
  }, []);
  
  const checkAccessRequirements = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) {
        return { hasAccess: false, reason: 'Profile not found' };
      }
      
      const requirements = {
        hasValidRole: !!profile.user_roles,
        hasCompletedOnboarding: profile.onboarding_completed === true,
        hasBasicInfo: !!profile.name && !!profile.email
      };
      
      const hasAccess = Object.values(requirements).every(Boolean);
      
      return {
        hasAccess,
        requirements,
        profile
      };
      
    } catch (error) {
      console.error('❌ [POST-ONBOARDING] Erro ao verificar requisitos:', error);
      return { hasAccess: false, reason: 'Error checking requirements' };
    }
  }, []);
  
  return {
    setupUserAccess,
    checkAccessRequirements
  };
};