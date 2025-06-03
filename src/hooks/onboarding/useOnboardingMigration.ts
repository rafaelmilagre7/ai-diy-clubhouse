
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useOnboardingMigration = () => {
  const { user } = useAuth();

  const runFullMigration = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado para migração');
      return { success: false, message: 'Usuário não autenticado' };
    }

    try {
      console.log('🔄 Verificando necessidade de migração...');
      
      // Verificar se existem dados antigos para migrar
      const { data: legacyData, error: legacyError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (legacyError && legacyError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar dados antigos:', legacyError);
        return { success: false, message: 'Erro ao verificar dados antigos' };
      }

      // Se não há dados antigos, não há necessidade de migração
      if (!legacyData) {
        console.log('✅ Nenhum dado antigo encontrado - migração não necessária');
        return { success: true, message: 'Nenhuma migração necessária' };
      }

      // Verificar se já existe registro no quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (quickError && quickError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar quick_onboarding:', quickError);
        return { success: false, message: 'Erro ao verificar dados atuais' };
      }

      // Se já existe dados no quick_onboarding, não migrar
      if (quickData) {
        console.log('✅ Dados já migrados anteriormente');
        return { success: true, message: 'Dados já migrados' };
      }

      // Realizar migração
      console.log('🔄 Iniciando migração de dados...');
      
      const migratedData = {
        user_id: user.id,
        name: legacyData.personal_info?.name || '',
        email: legacyData.personal_info?.email || user.email || '',
        company_name: legacyData.company_name || legacyData.professional_info?.company_name || '',
        company_size: legacyData.company_size || legacyData.professional_info?.company_size || '',
        company_segment: legacyData.company_sector || legacyData.professional_info?.company_sector || '',
        current_step: '1',
        is_completed: false
      };

      const { error: insertError } = await supabase
        .from('quick_onboarding')
        .insert(migratedData);

      if (insertError) {
        console.error('❌ Erro ao migrar dados:', insertError);
        return { success: false, message: 'Erro ao migrar dados' };
      }

      console.log('✅ Migração concluída com sucesso');
      
      // Toast apenas quando realmente houve migração
      toast.success('Dados migrados com sucesso!', {
        description: 'Seus dados anteriores foram transferidos automaticamente.',
        duration: 3000
      });

      return { success: true, message: 'Migração realizada com sucesso' };

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return { success: false, message: 'Erro inesperado na migração' };
    }
  }, [user?.id]);

  return { runFullMigration };
};
