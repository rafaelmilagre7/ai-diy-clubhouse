import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { SimpleOnboardingData } from '../types/simpleOnboardingTypes';
import { toast } from '@/hooks/use-toast';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SimpleOnboardingData>({
    current_step: 1,
    is_completed: false,
    goals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados existentes
  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: existingData, error } = await supabase
        .from('onboarding_simple')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados:', error);
        return;
      }

      if (existingData) {
        setData({
          name: existingData.name || '',
          email: existingData.email || '',
          phone: existingData.phone || '',
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          main_challenge: existingData.main_challenge || '',
          goals: existingData.goals || [],
          expectations: existingData.expectations || '',
          current_step: existingData.current_step || 1,
          is_completed: existingData.is_completed || false,
          completed_at: existingData.completed_at
        });
      } else {
        // Pré-preencher com dados do usuário se disponível
        setData(prev => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.name || ''
        }));
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar dados
  const saveData = async (newData: Partial<SimpleOnboardingData>) => {
    if (!user?.id) return false;
    
    setIsSaving(true);
    try {
      const updatedData = { ...data, ...newData };
      
      const { error } = await supabase
        .from('onboarding_simple')
        .upsert({
          user_id: user.id,
          ...updatedData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar suas informações. Tente novamente.',
          variant: 'destructive'
        });
        return false;
      }

      setData(updatedData);
      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Completar onboarding
  const completeOnboarding = async () => {
    const success = await saveData({
      is_completed: true,
      completed_at: new Date().toISOString()
    });
    
    if (success) {
      toast({
        title: 'Onboarding concluído!',
        description: 'Bem-vindo à plataforma! Você será redirecionado.',
      });
    }
    
    return success;
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  return {
    data,
    isLoading,
    isSaving,
    saveData,
    completeOnboarding
  };
};