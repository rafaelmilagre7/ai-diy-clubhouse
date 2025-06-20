
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface OnboardingDataResponse {
  data: OnboardingData | null;
  isLoading: boolean;
  error: string | null;
}

export const useOnboardingData = (): OnboardingDataResponse => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Tentar carregar da tabela user_onboarding primeiro
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id as any)
          .maybeSingle();

        if (onboardingError) {
          console.error('Erro ao carregar onboarding:', onboardingError);
        }

        if (onboardingData) {
          // Mapear dados da tabela para o formato OnboardingData
          const mappedData: OnboardingData = {
            name: (onboardingData as any).name,
            email: (onboardingData as any).email,
            phone: (onboardingData as any).phone,
            instagram: (onboardingData as any).instagram,
            linkedin: (onboardingData as any).linkedin,
            state: (onboardingData as any).state,
            city: (onboardingData as any).city,
            birthDate: (onboardingData as any).birth_date,
            curiosity: (onboardingData as any).curiosity,
            companyName: (onboardingData as any).company_name,
            companyWebsite: (onboardingData as any).company_website,
            businessSector: (onboardingData as any).business_sector,
            companySize: (onboardingData as any).company_size,
            annualRevenue: (onboardingData as any).annual_revenue,
            position: (onboardingData as any).position,
            hasImplementedAI: (onboardingData as any).has_implemented_ai,
            aiToolsUsed: (onboardingData as any).ai_tools_used,
            aiKnowledgeLevel: (onboardingData as any).ai_knowledge_level,
            dailyTools: (onboardingData as any).daily_tools,
            whoWillImplement: (onboardingData as any).who_will_implement,
            mainObjective: (onboardingData as any).main_objective,
            areaToImpact: (onboardingData as any).area_to_impact,
            expectedResult90Days: (onboardingData as any).expected_result_90_days,
            aiImplementationBudget: (onboardingData as any).ai_implementation_budget,
            weeklyLearningTime: (onboardingData as any).weekly_learning_time,
            contentPreference: (onboardingData as any).content_preference,
            wantsNetworking: (onboardingData as any).wants_networking,
            bestDays: (onboardingData as any).best_days,
            bestPeriods: (onboardingData as any).best_periods,
            acceptsCaseStudy: (onboardingData as any).accepts_case_study,
            memberType: (onboardingData as any).member_type,
            completedAt: (onboardingData as any).completed_at,
            startedAt: (onboardingData as any).started_at
          };

          setData(mappedData);
        } else {
          // Se não encontrou na tabela, tentar carregar do localStorage
          const localData = localStorage.getItem('viver-ia-onboarding-data');
          if (localData) {
            const parsedData = JSON.parse(localData);
            setData(parsedData);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do onboarding:', err);
        setError('Erro ao carregar dados do onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, [user?.id]);

  return { data, isLoading, error };
};
