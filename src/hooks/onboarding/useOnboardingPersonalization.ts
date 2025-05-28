
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export interface PersonalizationData {
  // Dados pessoais
  name: string;
  email: string;
  company_name: string;
  role: string;
  company_size: string;
  company_segment: string;
  annual_revenue_range: string;
  
  // Experiência com IA
  ai_knowledge_level: string;
  uses_ai: string;
  main_goal: string;
  desired_ai_areas: string[];
  has_implemented: string;
  previous_tools: string[];
  
  // Networking
  how_found_us: string;
  linkedin_url: string;
  instagram_url: string;
  
  // Meta
  is_completed: boolean;
}

export function useOnboardingPersonalization() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-personalization', user?.id],
    queryFn: async (): Promise<PersonalizationData | null> => {
      if (!user?.id) return null;

      // Primeiro tentar quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (quickData && !quickError) {
        return {
          name: quickData.name || '',
          email: quickData.email || '',
          company_name: quickData.company_name || '',
          role: quickData.role || '',
          company_size: quickData.company_size || '',
          company_segment: quickData.company_segment || '',
          annual_revenue_range: quickData.annual_revenue_range || '',
          ai_knowledge_level: quickData.ai_knowledge_level || '',
          uses_ai: quickData.uses_ai || '',
          main_goal: quickData.main_goal || '',
          desired_ai_areas: quickData.desired_ai_areas || [],
          has_implemented: quickData.has_implemented || '',
          previous_tools: quickData.previous_tools || [],
          how_found_us: quickData.how_found_us || '',
          linkedin_url: quickData.linkedin_url || '',
          instagram_url: quickData.instagram_url || '',
          is_completed: quickData.is_completed || false
        };
      }

      // Fallback para onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData && !progressError) {
        return {
          name: progressData.personal_info?.name || '',
          email: progressData.personal_info?.email || '',
          company_name: progressData.professional_info?.company_name || progressData.company_name || '',
          role: progressData.professional_info?.current_position || progressData.current_position || '',
          company_size: progressData.professional_info?.company_size || progressData.company_size || '',
          company_segment: progressData.professional_info?.company_sector || progressData.company_sector || '',
          annual_revenue_range: progressData.professional_info?.annual_revenue || progressData.annual_revenue || '',
          ai_knowledge_level: progressData.ai_experience?.knowledge_level || '',
          uses_ai: progressData.ai_experience?.has_implemented || '',
          main_goal: progressData.business_goals?.primary_goal || '',
          desired_ai_areas: progressData.ai_experience?.desired_ai_areas || [],
          has_implemented: progressData.ai_experience?.has_implemented || '',
          previous_tools: progressData.ai_experience?.previous_tools || [],
          how_found_us: progressData.complementary_info?.how_found_us || '',
          linkedin_url: progressData.personal_info?.linkedin || '',
          instagram_url: progressData.personal_info?.instagram || '',
          is_completed: progressData.is_completed || false
        };
      }

      return null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
