
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useQuickOnboardingAutoSave = (data: QuickOnboardingData) => {
  const { user } = useAuth();
  const lastSaveRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Converte dados para string para comparação
  const dataString = JSON.stringify(data);

  // Função para salvar no Supabase
  const saveToSupabase = useCallback(async (onboardingData: QuickOnboardingData) => {
    if (!user?.id) return;

    try {
      // Verificar se já existe um registro
      const { data: existingRecord } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const dataToSave = {
        user_id: user.id,
        current_step: 1, // Será atualizado conforme progresso
        updated_at: new Date().toISOString(),
        ...onboardingData
      };

      if (existingRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('quick_onboarding')
          .update(dataToSave)
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('quick_onboarding')
          .insert([dataToSave]);

        if (error) throw error;
      }

      console.log('Dados salvos automaticamente no Supabase');
    } catch (error) {
      console.error('Erro ao salvar dados automaticamente:', error);
    }
  }, [user?.id]);

  // Auto-save com debounce
  useEffect(() => {
    // Só salva se os dados mudaram
    if (dataString === lastSaveRef.current) return;
    
    // Só salva se tem dados mínimos
    if (!data.name || !data.email) return;

    // Limpa timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programa novo save com delay
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(data);
      lastSaveRef.current = dataString;
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

  return { saveToSupabase };
};
