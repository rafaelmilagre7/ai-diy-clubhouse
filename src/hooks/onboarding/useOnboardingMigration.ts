
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useOnboardingMigration = () => {
  const { user } = useAuth();

  // Migrar dados da tabela onboarding_progress para quick_onboarding
  const migrateFromOnboardingProgress = useCallback(async () => {
    if (!user?.id) return { success: false, message: 'Usuário não autenticado' };

    try {
      console.log('🔄 Iniciando migração de dados antigos...');

      // Buscar dados na tabela onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar onboarding_progress:', progressError);
        return { success: false, message: 'Erro ao buscar dados antigos' };
      }

      if (!progressData) {
        console.log('ℹ️ Nenhum dado antigo encontrado para migração');
        return { success: true, message: 'Nenhum dado para migrar' };
      }

      // Mapear dados antigos para nova estrutura
      const migratedData = {
        user_id: user.id,
        name: progressData.personal_info?.name || '',
        email: progressData.personal_info?.email || user.email || '',
        whatsapp: progressData.personal_info?.phone || '',
        country_code: progressData.personal_info?.ddi || '+55',
        birth_date: progressData.personal_info?.birth_date || null,
        country: progressData.personal_info?.country || '',
        state: progressData.personal_info?.state || '',
        city: progressData.personal_info?.city || '',
        timezone: progressData.personal_info?.timezone || '',
        instagram_url: progressData.personal_info?.instagram || '',
        linkedin_url: progressData.personal_info?.linkedin || '',
        how_found_us: progressData.complementary_info?.how_found_us || '',
        referred_by: progressData.complementary_info?.referred_by || '',
        role: progressData.personal_info?.role || '',
        company_name: progressData.company_name || progressData.professional_info?.company_name || '',
        company_size: progressData.company_size || progressData.professional_info?.company_size || '',
        company_segment: progressData.company_sector || progressData.professional_info?.company_sector || '',
        company_website: progressData.company_website || progressData.professional_info?.company_website || '',
        annual_revenue_range: progressData.annual_revenue || progressData.professional_info?.annual_revenue || '',
        business_model: progressData.business_context?.business_model || '',
        business_challenges: progressData.business_context?.business_challenges || [],
        additional_context: progressData.business_context?.additional_context || '',
        primary_goal: progressData.business_goals?.primary_goal || '',
        expected_outcome_30days: progressData.business_goals?.expected_outcome_30days || '',
        week_availability: progressData.business_goals?.week_availability || '',
        ai_knowledge_level: progressData.ai_experience?.knowledge_level || progressData.ai_experience?.ai_experience?.knowledge_level || '',
        has_implemented: progressData.ai_experience?.has_implemented || progressData.ai_experience?.ai_experience?.has_implemented || '',
        previous_tools: progressData.ai_experience?.previous_tools || progressData.ai_experience?.ai_experience?.previous_tools || [],
        desired_ai_areas: progressData.ai_experience?.desired_ai_areas || progressData.ai_experience?.ai_experience?.desired_ai_areas || [],
        interests: progressData.experience_personalization?.interests || [],
        time_preference: progressData.experience_personalization?.time_preference || [],
        networking_availability: progressData.experience_personalization?.networking_availability || 0,
        skills_to_share: progressData.experience_personalization?.skills_to_share || [],
        is_completed: progressData.is_completed || false,
        current_step: progressData.is_completed ? 8 : 1,
        created_at: progressData.created_at,
        updated_at: new Date().toISOString()
      };

      // Inserir na nova tabela
      const { error: insertError } = await supabase
        .from('quick_onboarding')
        .upsert(migratedData, {
          onConflict: 'user_id'
        });

      if (insertError) {
        console.error('❌ Erro ao inserir dados migrados:', insertError);
        return { success: false, message: 'Erro ao migrar dados' };
      }

      console.log('✅ Migração concluída com sucesso');
      return { success: true, message: 'Dados migrados com sucesso' };

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return { success: false, message: 'Erro inesperado na migração' };
    }
  }, [user?.id, user?.email]);

  // Limpar dados duplicados e inconsistentes
  const cleanupDuplicatedData = useCallback(async () => {
    if (!user?.id) return { success: false, message: 'Usuário não autenticado' };

    try {
      console.log('🧹 Iniciando limpeza de dados duplicados...');

      // Verificar se existem múltiplos registros para o mesmo usuário
      const { data: duplicates, error: duplicatesError } = await supabase
        .from('quick_onboarding')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (duplicatesError) {
        console.error('❌ Erro ao buscar duplicatas:', duplicatesError);
        return { success: false, message: 'Erro ao verificar duplicatas' };
      }

      if (duplicates && duplicates.length > 1) {
        // Manter apenas o mais recente, remover os outros
        const toDelete = duplicates.slice(1);
        
        for (const duplicate of toDelete) {
          const { error: deleteError } = await supabase
            .from('quick_onboarding')
            .delete()
            .eq('id', duplicate.id);

          if (deleteError) {
            console.error('❌ Erro ao deletar duplicata:', deleteError);
          }
        }

        console.log(`✅ Removidas ${toDelete.length} duplicatas`);
      }

      return { success: true, message: 'Limpeza concluída' };

    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      return { success: false, message: 'Erro inesperado na limpeza' };
    }
  }, [user?.id]);

  // Validar integridade dos dados
  const validateDataIntegrity = useCallback(async () => {
    if (!user?.id) return { success: false, message: 'Usuário não autenticado' };

    try {
      console.log('🔍 Validando integridade dos dados...');

      const { data: onboardingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar dados:', error);
        return { success: false, message: 'Erro ao validar dados' };
      }

      if (!onboardingData) {
        return { success: true, message: 'Nenhum dado para validar' };
      }

      // Verificações de integridade
      const issues = [];

      // Verificar campos obrigatórios básicos
      if (!onboardingData.name) issues.push('Nome não preenchido');
      if (!onboardingData.email) issues.push('Email não preenchido');
      if (!onboardingData.whatsapp) issues.push('WhatsApp não preenchido');

      // Verificar formato de arrays JSON
      const jsonFields = ['business_challenges', 'previous_tools', 'desired_ai_areas', 'interests', 'time_preference', 'skills_to_share'];
      for (const field of jsonFields) {
        if (onboardingData[field] && !Array.isArray(onboardingData[field])) {
          issues.push(`Campo ${field} não é um array válido`);
        }
      }

      if (issues.length > 0) {
        console.warn('⚠️ Problemas de integridade encontrados:', issues);
        return { success: false, message: `Problemas encontrados: ${issues.join(', ')}` };
      }

      console.log('✅ Dados íntegros');
      return { success: true, message: 'Dados validados com sucesso' };

    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return { success: false, message: 'Erro inesperado na validação' };
    }
  }, [user?.id]);

  // Executar migração completa
  const runFullMigration = useCallback(async () => {
    try {
      console.log('🚀 Iniciando migração completa...');

      const migrationResult = await migrateFromOnboardingProgress();
      if (!migrationResult.success) {
        return migrationResult;
      }

      const cleanupResult = await cleanupDuplicatedData();
      if (!cleanupResult.success) {
        return cleanupResult;
      }

      const validationResult = await validateDataIntegrity();
      if (!validationResult.success) {
        return validationResult;
      }

      toast.success('Migração completa realizada com sucesso!');
      return { success: true, message: 'Migração completa concluída' };

    } catch (error) {
      console.error('❌ Erro na migração completa:', error);
      toast.error('Erro na migração completa');
      return { success: false, message: 'Erro na migração completa' };
    }
  }, [migrateFromOnboardingProgress, cleanupDuplicatedData, validateDataIntegrity]);

  return {
    migrateFromOnboardingProgress,
    cleanupDuplicatedData,
    validateDataIntegrity,
    runFullMigration
  };
};
