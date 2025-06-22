
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { OnboardingData } from '../types/onboardingTypes';
import { getUserRoleName } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';

export const useOnboardingInitialization = (
  data: OnboardingData,
  updateData: (newData: Partial<OnboardingData>) => void
) => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const roleName = getUserRoleName(profile);
  const memberType = roleName === 'formacao' ? 'formacao' : 'club';

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Criar dados iniciais se necessário
        if (Object.keys(data).length === 1) {
          const initialData: OnboardingData = {
            name: profile?.name || '',
            email: profile?.email || user?.email || '',
            phone: (profile as any)?.phone || '',
            instagram: (profile as any)?.instagram || '',
            linkedin: (profile as any)?.linkedin || '',
            state: (profile as any)?.state || '',
            city: (profile as any)?.city || '',
            birthDate: (profile as any)?.birth_date || '',
            curiosity: (profile as any)?.curiosity || '',
            companyName: (profile as any)?.company_name || '',
            companyWebsite: (profile as any)?.company_website || '',
            businessSector: (profile as any)?.business_sector || '',
            companySize: (profile as any)?.company_size || '',
            annualRevenue: (profile as any)?.annual_revenue || '',
            position: (profile as any)?.position || '',
            hasImplementedAI: (profile as any)?.has_implemented_ai || 'nao',
            aiToolsUsed: (profile as any)?.ai_tools_used || [],
            aiKnowledgeLevel: (profile as any)?.ai_knowledge_level || '',
            dailyTools: (profile as any)?.daily_tools || [],
            whoWillImplement: (profile as any)?.who_will_implement || '',
            mainObjective: (profile as any)?.main_objective || '',
            areaToImpact: (profile as any)?.area_to_impact || '',
            expectedResult90Days: (profile as any)?.expected_result_90_days || '',
            aiImplementationBudget: (profile as any)?.ai_implementation_budget || '',
            weeklyLearningTime: (profile as any)?.weekly_learning_time || '',
            contentPreference: (profile as any)?.content_preference || [],
            wantsNetworking: (profile as any)?.wants_networking || 'nao',
            bestDays: (profile as any)?.best_days || [],
            bestPeriods: (profile as any)?.best_periods || [],
            acceptsCaseStudy: (profile as any)?.accepts_case_study || 'nao',
            memberType
          };
          
          updateData(initialData);
        }
        
        // Atualizar avatar se necessário
        if (user.email) {
          const profileUpdate = {
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=0D8ABC&color=fff`
          };

          await supabase
            .from('profiles')
            .update(profileUpdate as any)
            .eq('id', user.id as any);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, data, updateData, profile]);

  return {
    isLoading,
    memberType
  };
};
