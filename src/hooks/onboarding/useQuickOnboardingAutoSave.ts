
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
        
        // Verificar se já existe um progresso de onboarding
        const { data: existingProgress, error: fetchError } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

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

        if (existingProgress) {
          // Atualizar progresso existente
          const { error: updateError } = await supabase
            .from('onboarding_progress')
            .update(progressData)
            .eq('id', existingProgress.id);

          if (updateError) throw updateError;
        } else {
          // Criar novo progresso
          const { error: insertError } = await supabase
            .from('onboarding_progress')
            .insert([progressData]);

          if (insertError) throw insertError;
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
