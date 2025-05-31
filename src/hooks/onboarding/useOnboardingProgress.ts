
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingProgress } from '@/types/onboarding';
import { toast } from 'sonner';

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar progresso do usuário
  const loadProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      console.log('📖 Carregando progresso do onboarding...');

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar progresso:', error);
        return null;
      }

      console.log('✅ Progresso carregado:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar progresso:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Salvar ou atualizar progresso
  const saveProgress = useCallback(async (progressData: Partial<OnboardingProgress>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      console.log('💾 Salvando progresso...', progressData);

      // Validar e limpar dados antes de enviar
      const cleanedData = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
        ...progressData
      };

      // Remover campos undefined que podem causar problemas
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof typeof cleanedData] === undefined) {
          delete cleanedData[key as keyof typeof cleanedData];
        }
      });

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(cleanedData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao salvar progresso:', error);
        console.error('❌ Dados que causaram erro:', cleanedData);
        
        // Não mostrar toast para auto-save, apenas para saves manuais
        if (!progressData.current_step?.startsWith('step_')) {
          toast.error('Erro ao salvar progresso');
        }
        return false;
      }

      console.log('✅ Progresso salvo com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar progresso:', error);
      
      // Não mostrar toast para auto-save
      if (!progressData.current_step?.startsWith('step_')) {
        toast.error('Erro inesperado ao salvar');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // Marcar onboarding como completo
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log('🎯 Marcando onboarding como completo...');

      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      console.log('✅ Onboarding concluído com sucesso');
      toast.success('Onboarding concluído!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao completar onboarding:', error);
      toast.error('Erro inesperado');
      return false;
    }
  }, [user?.id]);

  return {
    loadProgress,
    saveProgress,
    completeOnboarding,
    isLoading,
    isSaving
  };
};
