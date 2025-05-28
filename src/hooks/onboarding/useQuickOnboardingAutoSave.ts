
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useQuickOnboardingAutoSave = (data: QuickOnboardingData) => {
  const { user } = useAuth();
  const lastSaveRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isSaving = useRef(false);

  // Converte dados para string para comparação
  const dataString = JSON.stringify(data);

  // Função para salvar no Supabase com retry
  const saveToSupabase = useCallback(async (onboardingData: QuickOnboardingData, retryCount = 0): Promise<boolean> => {
    if (!user?.id || isSaving.current) return false;

    try {
      isSaving.current = true;
      
      console.log('💾 Salvando dados automaticamente...', { user_id: user.id });

      // Verificar se já existe um registro
      const { data: existingRecord, error: checkError } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const dataToSave = {
        user_id: user.id,
        current_step: getCurrentStep(onboardingData),
        updated_at: new Date().toISOString(),
        ...onboardingData
      };

      let saveError;

      if (existingRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('quick_onboarding')
          .update(dataToSave)
          .eq('id', existingRecord.id);
        saveError = error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('quick_onboarding')
          .insert([dataToSave]);
        saveError = error;
      }

      if (saveError) throw saveError;

      // Também sincronizar com o sistema antigo para compatibilidade
      await syncWithLegacyOnboarding(user.id, onboardingData);

      console.log('✅ Dados salvos automaticamente no Supabase');
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar dados automaticamente:', error);
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Tentativa ${retryCount + 1} de reenvio...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return saveToSupabase(onboardingData, retryCount + 1);
      }
      
      // Toast de erro só após todas as tentativas
      toast.error('Erro ao salvar dados. Suas alterações serão salvas quando a conexão for restabelecida.');
      return false;
    } finally {
      isSaving.current = false;
    }
  }, [user?.id]);

  // Função para determinar o passo atual baseado nos dados
  const getCurrentStep = (data: QuickOnboardingData): number => {
    if (!data.name || !data.email || !data.whatsapp || !data.how_found_us) {
      return 1;
    }
    if (!data.company_name || !data.role || !data.company_size || !data.company_segment) {
      return 2;
    }
    if (!data.ai_knowledge_level || !data.uses_ai || !data.main_goal) {
      return 3;
    }
    return 4; // Completo
  };

  // Sincronizar com o sistema de onboarding antigo
  const syncWithLegacyOnboarding = async (userId: string, data: QuickOnboardingData) => {
    try {
      const legacyData = {
        user_id: userId,
        personal_info: {
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          birth_date: data.birth_date,
          instagram_url: data.instagram_url,
          linkedin_url: data.linkedin_url,
          how_found_us: data.how_found_us,
          referred_by: data.referred_by
        },
        professional_info: {
          company_name: data.company_name,
          role: data.role,
          company_size: data.company_size,
          company_segment: data.company_segment,
          company_website: data.company_website,
          annual_revenue_range: data.annual_revenue_range,
          main_challenge: data.main_challenge
        },
        ai_experience: {
          knowledge_level: data.ai_knowledge_level,
          uses_ai: data.uses_ai,
          main_goal: data.main_goal
        },
        is_completed: false,
        completed_steps: getCompletedSteps(data),
        current_step: getCurrentStepName(data),
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('onboarding_progress')
        .upsert(legacyData);

    } catch (error) {
      console.error('Erro ao sincronizar com sistema legado:', error);
      // Não bloquear o save principal por erro na sincronização
    }
  };

  const getCompletedSteps = (data: QuickOnboardingData): string[] => {
    const steps = [];
    if (data.name && data.email && data.whatsapp && data.how_found_us) {
      steps.push('personal_info');
    }
    if (data.company_name && data.role && data.company_size && data.company_segment) {
      steps.push('professional_info');
    }
    if (data.ai_knowledge_level && data.uses_ai && data.main_goal) {
      steps.push('ai_experience');
    }
    return steps;
  };

  const getCurrentStepName = (data: QuickOnboardingData): string => {
    const step = getCurrentStep(data);
    const stepNames = ['personal_info', 'professional_info', 'ai_experience', 'completed'];
    return stepNames[step - 1] || 'personal_info';
  };

  // Auto-save com debounce melhorado
  useEffect(() => {
    // Só salva se os dados mudaram
    if (dataString === lastSaveRef.current) return;
    
    // Só salva se tem dados mínimos válidos
    if (!data.name || !data.email) return;

    // Limpa timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programa novo save com delay
    saveTimeoutRef.current = setTimeout(async () => {
      const success = await saveToSupabase(data);
      if (success) {
        lastSaveRef.current = dataString;
      }
    }, 2000); // 2 segundos de delay

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dataString, data, saveToSupabase]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { 
    saveToSupabase: (data: QuickOnboardingData) => saveToSupabase(data),
    isSaving: isSaving.current
  };
};
