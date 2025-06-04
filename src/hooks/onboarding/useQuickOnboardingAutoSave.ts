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
  const sanitizeAutoSavePayload = (payload: any) => {
    console.log('🧹 Auto-save: Sanitizando payload');
    
    // Lista de campos permitidos na tabela quick_onboarding
    const allowedFields = [
      'user_id',
      'email',
      'whatsapp', 
      'country_code',
      'birth_date',
      'instagram_url',
      'linkedin_url',
      'how_found_us',
      'referred_by',
      'company_name',
      'role',
      'company_size',
      'company_segment',
      'company_website',
      'annual_revenue_range',
      'main_challenge',
      'ai_knowledge_level',
      'uses_ai',
      'main_goal',
      'desired_ai_areas',
      'has_implemented',
      'previous_tools',
      'is_completed'
    ];
    
    const clean: any = {};
    
    // Incluir apenas campos permitidos
    allowedFields.forEach(field => {
      if (field === 'user_id') {
        clean[field] = user?.id;
      } else if (field === 'is_completed') {
        clean[field] = false; // Manter false até conclusão manual
      } else if (payload.hasOwnProperty(field)) {
        const value = payload[field];
        
        // Tratar casos especiais
        if (field === 'birth_date' && value === '') {
          clean[field] = null;
        } else if (field === 'instagram_url' && value === '') {
          clean[field] = null;
        } else if (field === 'linkedin_url' && value === '') {
          clean[field] = null;
        } else if (field === 'company_website' && value === '') {
          clean[field] = null;
        } else if (field === 'referred_by' && value === '') {
          clean[field] = null;
        } else if (['desired_ai_areas', 'previous_tools'].includes(field)) {
          clean[field] = Array.isArray(value) ? value : [];
        } else if (value !== undefined && value !== '') {
          clean[field] = value;
        }
      }
    });

    // Garantir campos obrigatórios
    if (!clean.email || clean.email === '') {
      clean.email = user?.email || '';
    }

    console.log('✅ Auto-save payload sanitizado:', JSON.stringify(clean, null, 2));
    return clean;
  };

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
