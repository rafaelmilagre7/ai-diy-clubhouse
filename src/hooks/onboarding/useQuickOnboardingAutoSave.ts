
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
    // Só salvar se o usuário estiver logado e houver dados
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

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Se não for erro de "não encontrado", logar e tentar onboarding_progress
          console.log('Tabela quick_onboarding não encontrada, usando onboarding_progress');
        }

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
          // Tentar criar novo registro na tabela quick_onboarding
          const { error: insertError } = await supabase
            .from('quick_onboarding')
            .insert([{ ...quickOnboardingData, created_at: new Date().toISOString() }]);

          if (insertError) {
            // Se falhou, usar a tabela onboarding_progress como fallback
            console.log('Usando onboarding_progress como fallback');
            
            const progressData = {
              user_id: user.id,
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
                has_implemented: data.has_implemented
              },
              business_goals: {
                primary_goal: data.main_goal,
                expected_outcomes: []
              },
              complementary_info: {
                how_found_us: data.how_found_us,
                referred_by: data.referred_by
              },
              current_step: 'personal_info',
              completed_steps: ['personal_info'],
              is_completed: false,
              updated_at: new Date().toISOString()
            };

            const { data: existingProgress } = await supabase
              .from('onboarding_progress')
              .select('*')
              .eq('user_id', user.id)
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
          }
        }

        setLastSaveTime(Date.now());
        console.log('✅ Dados do onboarding salvos automaticamente');
        
      } catch (error: any) {
        console.error('❌ Erro ao salvar dados automaticamente:', error);
        // Não mostrar toast de erro para não interromper o usuário
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
