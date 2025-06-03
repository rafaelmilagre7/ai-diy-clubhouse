
import { useEffect, useRef, useState } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useQuickOnboardingAutoSave = (data: QuickOnboardingData) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  useEffect(() => {
    // Só salvar se o usuário estiver logado e houver dados básicos
    if (!user || !data.name) return;

    // Verificar se os dados mudaram
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastDataRef.current) return;
    
    lastDataRef.current = currentDataString;

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Salvar após 2 segundos de inatividade (debounce)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        
        // Verificar se já existe um registro na tabela quick_onboarding
        const { data: existingData, error: fetchError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const quickOnboardingData = {
          user_id: user.id,
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          birth_date: data.birth_date || null,
          instagram_url: data.instagram_url || null,
          linkedin_url: data.linkedin_url || null,
          how_found_us: data.how_found_us,
          referred_by: data.referred_by || null,
          company_name: data.company_name,
          role: data.role,
          company_size: data.company_size,
          company_segment: data.company_segment,
          company_website: data.company_website || null,
          annual_revenue_range: data.annual_revenue_range,
          main_challenge: data.main_challenge,
          ai_knowledge_level: data.ai_knowledge_level,
          uses_ai: data.uses_ai,
          main_goal: data.main_goal,
          desired_ai_areas: data.desired_ai_areas,
          has_implemented: data.has_implemented,
          previous_tools: data.previous_tools,
          updated_at: new Date().toISOString()
        };

        if (existingData && !fetchError) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('quick_onboarding')
            .update(quickOnboardingData)
            .eq('id', existingData.id);

          if (updateError) throw updateError;
        } else {
          // Criar novo registro
          const { error: insertError } = await supabase
            .from('quick_onboarding')
            .insert([{ 
              ...quickOnboardingData, 
              created_at: new Date().toISOString(),
              is_completed: false
            }]);

          if (insertError) throw insertError;
        }

        // Também salvar/atualizar na tabela onboarding_progress para compatibilidade
        await saveToOnboardingProgress(data, user.id);

        setLastSaveTime(Date.now());
        console.log('✅ Dados do onboarding salvos automaticamente');
        
      } catch (error: any) {
        console.error('❌ Erro ao salvar dados automaticamente:', error);
        toast.error('Erro ao salvar dados. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, user]);

  return {
    isSaving,
    lastSaveTime
  };
};

// Função auxiliar para manter compatibilidade com onboarding_progress
const saveToOnboardingProgress = async (data: QuickOnboardingData, userId: string) => {
  try {
    const progressData = {
      user_id: userId,
      personal_info: {
        name: data.name,
        email: data.email,
        phone: data.whatsapp,
        ddi: data.country_code,
        linkedin: data.linkedin_url,
        instagram: data.instagram_url
      },
      professional_info: {
        company_name: data.company_name,
        current_position: data.role,
        company_size: data.company_size,
        company_sector: data.company_segment,
        company_website: data.company_website,
        annual_revenue: data.annual_revenue_range
      },
      ai_experience: {
        knowledge_level: data.ai_knowledge_level,
        previous_tools: data.previous_tools,
        desired_ai_areas: data.desired_ai_areas,
        has_implemented: data.has_implemented,
        uses_ai: data.uses_ai
      },
      business_goals: {
        primary_goal: data.main_goal,
        expected_outcomes: []
      },
      business_context: {
        business_challenges: data.main_challenge ? [data.main_challenge] : []
      },
      complementary_info: {
        how_found_us: data.how_found_us,
        referred_by: data.referred_by
      },
      experience_personalization: {},
      current_step: determineCurrentStep(data),
      completed_steps: getCompletedSteps(data),
      is_completed: isOnboardingCompleted(data),
      updated_at: new Date().toISOString()
    };

    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProgress) {
      await supabase
        .from('onboarding_progress')
        .update(progressData)
        .eq('id', existingProgress.id);
    } else {
      await supabase
        .from('onboarding_progress')
        .insert([progressData]);
    }
  } catch (error) {
    console.error('Erro ao salvar no onboarding_progress:', error);
  }
};

const determineCurrentStep = (data: QuickOnboardingData): string => {
  if (!data.name || !data.email || !data.whatsapp || !data.how_found_us) {
    return 'personal_info';
  }
  if (!data.company_name || !data.role || !data.company_size || !data.company_segment || !data.annual_revenue_range || !data.main_challenge) {
    return 'professional_info';
  }
  if (!data.ai_knowledge_level || !data.uses_ai || !data.main_goal) {
    return 'ai_experience';
  }
  return 'completed';
};

const getCompletedSteps = (data: QuickOnboardingData): string[] => {
  const steps: string[] = [];
  
  if (data.name && data.email && data.whatsapp && data.how_found_us) {
    steps.push('personal_info');
  }
  if (data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range && data.main_challenge) {
    steps.push('professional_info');
  }
  if (data.ai_knowledge_level && data.uses_ai && data.main_goal) {
    steps.push('ai_experience');
  }
  
  return steps;
};

const isOnboardingCompleted = (data: QuickOnboardingData): boolean => {
  return !!(
    data.name && data.email && data.whatsapp && data.how_found_us &&
    data.company_name && data.role && data.company_size && data.company_segment && 
    data.annual_revenue_range && data.main_challenge &&
    data.ai_knowledge_level && data.uses_ai && data.main_goal
  );
};
