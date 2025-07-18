import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Estrutura simples baseada em onboarding_final
export interface OnboardingData {
  user_id: string;
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    linkedin?: string;
  };
  business_info: {
    company_name?: string;
    position?: string;
    company_size?: string;
    business_sector?: string;
    annual_revenue?: string;
  };
  ai_experience: {
    knowledge_level?: string;
    has_implemented?: string;
    desired_areas?: string[];
    main_challenges?: string[];
  };
  goals_info: {
    primary_goal?: string;
    expected_results?: string[];
  };
  personalization: {
    communication_preference?: string;
    learning_style?: string;
  };
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

export const useOnboarding = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar dados
  useEffect(() => {
    if (!user?.id) return;

    const initializeData = async () => {
      try {
        // Buscar dados existentes
        const { data: existingData, error } = await supabase
          .from('onboarding_final')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingData) {
          // Usar dados existentes
          setData({
            user_id: user.id,
            personal_info: existingData.personal_info || {},
            business_info: existingData.business_info || {},
            ai_experience: existingData.ai_experience || {},
            goals_info: existingData.goals_info || {},
            personalization: existingData.personalization || {},
            current_step: existingData.current_step || 1,
            completed_steps: existingData.completed_steps || [],
            is_completed: existingData.is_completed || false,
          });
        } else {
          // Criar dados iniciais
          const initialData: OnboardingData = {
            user_id: user.id,
            personal_info: {
              name: profile?.name || '',
              email: user.email || '',
            },
            business_info: {},
            ai_experience: {},
            goals_info: {},
            personalization: {},
            current_step: 1,
            completed_steps: [],
            is_completed: false,
          };
          setData(initialData);
        }
      } catch (error) {
        console.error('Erro ao inicializar onboarding:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar dados do onboarding',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [user?.id, profile]);

  // Atualizar dados
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Salvar dados
  const save = useCallback(async () => {
    if (!data || !user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: data.personal_info,
          business_info: data.business_info,
          ai_experience: data.ai_experience,
          goals_info: data.goals_info,
          personalization: data.personalization,
          current_step: data.current_step,
          completed_steps: data.completed_steps,
          is_completed: data.is_completed,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Dados salvos com sucesso',
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, user?.id]);

  // Finalizar onboarding
  const complete = useCallback(async () => {
    if (!data) return false;

    const updatedData = {
      ...data,
      is_completed: true,
      current_step: 6,
      completed_steps: [1, 2, 3, 4, 5, 6],
    };

    setData(updatedData);
    const success = await save();

    if (success) {
      // Atualizar flag no profile
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user?.id);
    }

    return success;
  }, [data, save, user?.id]);

  return {
    data,
    isLoading,
    isSaving,
    updateData,
    save,
    complete,
    currentStep: data?.current_step || 1,
  };
};