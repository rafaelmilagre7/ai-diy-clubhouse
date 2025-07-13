import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { OnboardingData } from '../types/onboardingTypes';

// Mapeamento do frontend complexo para o backend simplificado
interface SimpleOnboardingData {
  id?: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  role?: string;
  company_size?: string;
  main_challenge?: string;
  goals?: string[];
  expectations?: string;
  current_step: number;
  is_completed: boolean;
  completed_at?: string;
}

export const useSimpleOnboardingAdapter = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mapear dados complexos do frontend para o backend simplificado
  const mapToSimpleData = useCallback((complexData: any): SimpleOnboardingData => {
    // Extrair principais objetivos dos goals_info
    const goals: string[] = [];
    if (complexData.goals_info?.mainObjective) goals.push(complexData.goals_info.mainObjective);
    if (complexData.goals_info?.areaToImpact) goals.push(complexData.goals_info.areaToImpact);
    if (complexData.ai_experience?.aiImplementationObjective) goals.push(complexData.ai_experience.aiImplementationObjective);

    return {
      user_id: user?.id || '',
      name: complexData.personal_info?.name || '',
      email: complexData.personal_info?.email || '',
      phone: complexData.personal_info?.phone || '',
      company_name: complexData.business_info?.companyName || '',
      role: complexData.business_info?.position || '',
      company_size: complexData.business_info?.companySize || '',
      main_challenge: complexData.ai_experience?.aiMainChallenge || complexData.goals_info?.mainObstacle || '',
      goals: goals.filter(Boolean),
      expectations: complexData.goals_info?.expectedResult90Days || '',
      current_step: complexData.current_step || 1,
      is_completed: complexData.is_completed || false,
      completed_at: complexData.is_completed ? new Date().toISOString() : undefined
    };
  }, [user?.id]);

  // Mapear dados simples do backend para o frontend complexo
  const mapToComplexData = useCallback((simpleData: SimpleOnboardingData): any => {
    return {
      personal_info: {
        name: simpleData.name || '',
        email: simpleData.email || '',
        phone: simpleData.phone || ''
      },
      location_info: {}, // Será preenchido conforme necessário
      discovery_info: {}, // Será preenchido conforme necessário
      business_info: {
        companyName: simpleData.company_name || '',
        position: simpleData.role || '',
        companySize: simpleData.company_size || ''
      },
      business_context: {},
      goals_info: {
        mainObjective: simpleData.goals?.[0] || '',
        areaToImpact: simpleData.goals?.[1] || '',
        expectedResult90Days: simpleData.expectations || '',
        mainObstacle: simpleData.main_challenge || ''
      },
      ai_experience: {
        aiMainChallenge: simpleData.main_challenge || '',
        aiImplementationObjective: simpleData.goals?.[2] || ''
      },
      personalization: {},
      current_step: simpleData.current_step || 1,
      completed_steps: Array.from({ length: (simpleData.current_step || 1) - 1 }, (_, i) => i + 1),
      is_completed: simpleData.is_completed || false
    };
  }, []);

  // Carregar dados do backend simplificado
  const loadOnboardingData = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      console.warn('❌ [ADAPTER] Usuário não autenticado');
      return null;
    }

    setIsLoading(true);
    console.log('🔍 [ADAPTER] Carregando dados para usuário:', user.id);

    try {
      const { data, error } = await supabase
        .from('onboarding_simple')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [ADAPTER] Erro ao carregar:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [ADAPTER] Dados carregados:', data);
        return mapToComplexData(data);
      } else {
        console.log('📭 [ADAPTER] Nenhum dado encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ [ADAPTER] Erro inesperado:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus dados de onboarding.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, mapToComplexData]);

  // Salvar dados no backend simplificado
  const saveOnboardingData = useCallback(async (complexData: any): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ [ADAPTER] Usuário não autenticado');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive",
      });
      return false;
    }

    if (isSaving) {
      console.warn('⚠️ [ADAPTER] Já está salvando, cancelando');
      return false;
    }

    setIsSaving(true);
    console.log('💾 [ADAPTER] Iniciando salvamento...');

    try {
      const simpleData = mapToSimpleData(complexData);
      console.log('💾 [ADAPTER] Dados mapeados:', simpleData);

      const { error } = await supabase
        .from('onboarding_simple')
        .upsert(simpleData);

      if (error) {
        console.error('❌ [ADAPTER] Erro ao salvar:', error);
        throw error;
      }

      console.log('✅ [ADAPTER] Dados salvos com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ [ADAPTER] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, isSaving, mapToSimpleData]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (complexData: any): Promise<boolean> => {
    console.log('🎯 [ADAPTER] Completando onboarding...');
    
    const completedData = {
      ...complexData,
      is_completed: true,
      completed_at: new Date().toISOString()
    };

    const success = await saveOnboardingData(completedData);
    
    if (success) {
      // Atualizar perfil
      try {
        const simpleData = mapToSimpleData(completedData);
        await supabase
          .from('profiles')
          .update({
            name: simpleData.name,
            company_name: simpleData.company_name,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', user?.id);

        console.log('✅ [ADAPTER] Perfil atualizado');
      } catch (error) {
        console.error('⚠️ [ADAPTER] Erro ao atualizar perfil:', error);
        // Não bloquear o fluxo
      }
    }

    return success;
  }, [saveOnboardingData, mapToSimpleData, user?.id]);

  return {
    loadOnboardingData,
    saveOnboardingData,
    completeOnboarding,
    isLoading,
    isSaving
  };
};