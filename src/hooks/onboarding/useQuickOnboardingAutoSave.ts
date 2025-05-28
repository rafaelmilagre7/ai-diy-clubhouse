import { useEffect, useRef, useCallback, useState } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useQuickOnboardingAutoSave = (data: QuickOnboardingData, currentStep: number) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  const saveData = useCallback(async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      console.log(`💾 Auto-salvando dados da etapa ${currentStep}...`);

      const { data: existing, error: checkError } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const savePayload = {
        user_id: user.id,
        name: data.name || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        country_code: data.country_code || '+55',
        birth_date: data.birth_date || null,
        instagram_url: data.instagram_url || '',
        linkedin_url: data.linkedin_url || '',
        how_found_us: data.how_found_us || '',
        referred_by: data.referred_by || '',
        company_name: data.company_name || '',
        role: data.role || '',
        company_size: data.company_size || '',
        company_segment: data.company_segment || '',
        company_website: data.company_website || '',
        annual_revenue_range: data.annual_revenue_range || '',
        main_challenge: data.main_challenge || '',
        ai_knowledge_level: data.ai_knowledge_level || '',
        uses_ai: data.uses_ai || '',
        main_goal: data.main_goal || '',
        current_step: currentStep,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase
          .from('quick_onboarding')
          .update(savePayload)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('quick_onboarding')
          .insert([savePayload]);
      }

      if (result.error) {
        console.error('❌ Erro ao salvar dados:', result.error);
        throw result.error;
      }

      console.log(`✅ Dados salvos com sucesso (etapa ${currentStep})`);
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, data, currentStep]);

  useEffect(() => {
    if (!user) return;

    const currentDataString = JSON.stringify({ ...data, currentStep });
    if (currentDataString === lastDataRef.current) return;

    lastDataRef.current = currentDataString;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, currentStep, user, saveData]);

  return {
    isSaving,
    lastSaveTime
  };
};
