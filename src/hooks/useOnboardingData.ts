
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
          .eq('user_id', user.id)
          .maybeSingle();

        if (onboardingError) {
          console.error('Erro ao carregar onboarding:', onboardingError);
        }

        if (onboardingData) {
          // Mapear dados da tabela para o formato OnboardingData
          const mappedData: OnboardingData = {
            name: onboardingData.name,
            email: onboardingData.email,
            phone: onboardingData.phone,
            instagram: onboardingData.instagram,
            linkedin: onboardingData.linkedin,
            state: onboardingData.state,
            city: onboardingData.city,
            birthDate: onboardingData.birth_date,
            curiosity: onboardingData.curiosity,
            companyName: onboardingData.company_name,
            companyWebsite: onboardingData.company_website,
            businessSector: onboardingData.business_sector,
            companySize: onboardingData.company_size,
            annualRevenue: onboardingData.annual_revenue,
            position: onboardingData.position,
            hasImplementedAI: onboardingData.has_implemented_ai,
            aiToolsUsed: onboardingData.ai_tools_used,
            aiKnowledgeLevel: onboardingData.ai_knowledge_level,
            dailyTools: onboardingData.daily_tools,
            whoWillImplement: onboardingData.who_will_implement,
            mainObjective: onboardingData.main_objective,
            areaToImpact: onboardingData.area_to_impact,
            expectedResult90Days: onboardingData.expected_result_90_days,
            aiImplementationBudget: onboardingData.ai_implementation_budget,
            weeklyLearningTime: onboardingData.weekly_learning_time,
            contentPreference: onboardingData.content_preference,
            wantsNetworking: onboardingData.wants_networking,
            bestDays: onboardingData.best_days,
            bestPeriods: onboardingData.best_periods,
            acceptsCaseStudy: onboardingData.accepts_case_study,
            memberType: onboardingData.member_type,
            completedAt: onboardingData.completed_at,
            startedAt: onboardingData.started_at
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
