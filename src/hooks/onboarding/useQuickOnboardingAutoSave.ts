
import { useEffect, useRef, useState } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useQuickOnboardingAutoSave = (data: QuickOnboardingData) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  // Sanitizar payload rigorosamente antes de salvar
  const sanitizeAutoSavePayload = (payload: QuickOnboardingData) => {
    console.log('🧹 Auto-save: Sanitizando payload');
    
    const clean: any = {
      user_id: user?.id,
      name: payload.personal_info?.name || '',
      email: payload.personal_info?.email || user?.email || '',
      whatsapp: payload.personal_info?.whatsapp || '',
      country_code: payload.personal_info?.country_code || '+55',
      birth_date: payload.personal_info?.birth_date || null,
      instagram_url: payload.personal_info?.instagram_url || null,
      linkedin_url: payload.personal_info?.linkedin_url || null,
      how_found_us: payload.personal_info?.how_found_us || '',
      referred_by: payload.personal_info?.referred_by || null,
      company_name: payload.professional_info?.company_name || '',
      role: payload.professional_info?.role || '',
      company_size: payload.professional_info?.company_size || '',
      company_segment: payload.professional_info?.company_segment || '',
      company_website: payload.professional_info?.company_website || null,
      annual_revenue_range: payload.professional_info?.annual_revenue_range || '',
      main_challenge: payload.professional_info?.main_challenge || '',
      ai_knowledge_level: payload.ai_experience?.ai_knowledge_level || '',
      uses_ai: payload.ai_experience?.uses_ai || '',
      main_goal: payload.ai_experience?.main_goal || '',
      desired_ai_areas: payload.ai_experience?.desired_ai_areas || [],
      has_implemented: payload.ai_experience?.has_implemented || '',
      previous_tools: payload.ai_experience?.previous_tools || [],
      is_completed: false // Manter false até conclusão manual
    };

    console.log('✅ Auto-save payload sanitizado:', JSON.stringify(clean, null, 2));
    return clean;
  };

  useEffect(() => {
    // Só salvar se o usuário estiver logado e houver dados básicos
    if (!user || !data.personal_info?.name) return;

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
        console.log('💾 Auto-salvando dados do onboarding...');
        
        // Verificar se a sessão está válida
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.session) {
          console.error('❌ Sessão inválida durante auto-save:', sessionError);
          return;
        }
        
        // Preparar dados limpos para quick_onboarding
        const quickOnboardingData = sanitizeAutoSavePayload(data);

        console.log('📤 Auto-save: Enviando payload para quick_onboarding');

        // Usar upsert para inserir ou atualizar
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(quickOnboardingData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (quickError) {
          console.error('❌ Erro ao auto-salvar quick_onboarding:', quickError);
          
          // Se for erro de estrutura ou permissão, não continuar tentando
          if (quickError.code === '42703' || 
              quickError.code === '42P01' ||
              quickError.message?.includes('RLS') ||
              quickError.message?.includes('permission')) {
            console.error('❌ Auto-save: Erro estrutural/permissão - interrompendo auto-save');
            return;
          }
          
          throw quickError;
        }

        console.log('✅ quick_onboarding auto-salvo com sucesso');
        setLastSaveTime(Date.now());
        console.log('✅ Auto-save concluído com sucesso');
        
      } catch (error: any) {
        console.error('❌ Erro no auto-save:', error);
        // Em caso de erro estrutural, não fazer mais tentativas
        if (error.code === '42703' || 
            error.code === '42P01' ||
            error.status === 400 ||
            error.status === 403 ||
            error.message?.includes('does not exist')) {
          console.error('❌ Auto-save: Erro crítico detectado - interrompendo');
        }
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
