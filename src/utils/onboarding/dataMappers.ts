import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

export const mapToOnboardingProgress = (data: QuickOnboardingData): Partial<OnboardingProgress> => {
  return {
    personal_info: {
      name: data.name || '',
      email: data.email || '',
      whatsapp: data.whatsapp || '',
      country_code: data.country_code || '+55',
      birth_date: data.birth_date || '',
      _updated_at: new Date().toISOString()
    },
    professional_info: {
      company_name: data.company_name || '',
      role: data.role || '',
      company_size: data.company_size || '',
      company_segment: data.company_segment || '',
      company_website: data.company_website || '',
      annual_revenue_range: data.annual_revenue_range || '',
      current_position: data.current_position || '',
      _updated_at: new Date().toISOString()
    },
    business_context: {
      business_model: data.business_model || '',
      business_challenges: data.business_challenges || [],
      short_term_goals: data.short_term_goals || [],
      medium_term_goals: data.medium_term_goals || [],
      important_kpis: data.important_kpis || [],
      additional_context: data.additional_context || '',
      _updated_at: new Date().toISOString()
    },
    discovery_info: {
      how_found_us: data.how_found_us || '',
      referred_by: data.referred_by || '',
      _updated_at: new Date().toISOString()
    },
    goals_info: {
      primary_goal: data.primary_goal || '',
      expected_outcomes: data.expected_outcomes || [],
      expected_outcome_30days: data.expected_outcome_30days || '',
      priority_solution_type: data.priority_solution_type || '',
      how_implement: data.how_implement || '',
      week_availability: data.week_availability || '',
      content_formats: data.content_formats || [],
      _updated_at: new Date().toISOString()
    },
    ai_experience: {
      ai_knowledge_level: data.ai_knowledge_level || 'iniciante',
      previous_tools: data.previous_tools || [],
      has_implemented: data.has_implemented || '',
      desired_ai_areas: data.desired_ai_areas || [],
      completed_formation: data.completed_formation || false,
      is_member_for_month: data.is_member_for_month || false,
      nps_score: data.nps_score || 0,
      improvement_suggestions: data.improvement_suggestions || '',
      _updated_at: new Date().toISOString()
    },
    experience_personalization: {
      interests: data.interests || [],
      time_preference: data.time_preference || [],
      available_days: data.available_days || [],
      networking_availability: data.networking_availability || 5,
      skills_to_share: data.skills_to_share || [],
      mentorship_topics: data.mentorship_topics || [],
      live_interest: data.live_interest || 0,
      authorize_case_usage: data.authorize_case_usage || false,
      interested_in_interview: data.interested_in_interview || false,
      priority_topics: data.priority_topics || [],
      _updated_at: new Date().toISOString()
    },
    metadata: {
      source: 'quick_onboarding',
      version: '1.0',
      current_step: data.currentStep || 1,
      total_steps: data.currentStep ? Math.max(data.currentStep, 3) : 3,
      _updated_at: new Date().toISOString()
    }
  };
};
