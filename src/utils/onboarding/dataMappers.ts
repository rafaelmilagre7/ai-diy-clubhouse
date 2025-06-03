
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

export const mapToOnboardingProgress = (data: QuickOnboardingData): Partial<OnboardingProgress> => {
  return {
    personal_info: {
      name: data.name || '',
      email: data.email || '',
      whatsapp: data.whatsapp || '',
      country_code: data.country_code || '+55',
      birth_date: data.birth_date || ''
    },
    professional_info: {
      company_name: data.company_name || '',
      role: data.role || '',
      company_size: data.company_size || '',
      company_segment: data.company_segment || '',
      company_website: data.company_website || '',
      annual_revenue_range: data.annual_revenue_range || '',
      current_position: data.current_position || ''
    },
    business_context: {
      business_model: data.business_model || '',
      business_challenges: data.business_challenges || [],
      short_term_goals: data.short_term_goals || [],
      medium_term_goals: data.medium_term_goals || [],
      important_kpis: data.important_kpis || [],
      additional_context: data.additional_context || ''
    },
    discovery_info: {
      how_found_us: data.how_found_us || '',
      referred_by: data.referred_by || ''
    },
    goals_info: {
      primary_goal: data.primary_goal || '',
      expected_outcomes: data.expected_outcomes || [],
      expected_outcome_30days: data.expected_outcome_30days || '',
      priority_solution_type: data.priority_solution_type || '',
      how_implement: data.how_implement || '',
      week_availability: data.week_availability || '',
      content_formats: data.content_formats || []
    },
    ai_experience: {
      ai_knowledge_level: data.ai_knowledge_level || 'iniciante',
      previous_tools: data.previous_tools || [],
      has_implemented: data.has_implemented || '',
      desired_ai_areas: data.desired_ai_areas || [],
      completed_formation: data.completed_formation || false,
      is_member_for_month: data.is_member_for_month || false,
      nps_score: data.nps_score || 0,
      improvement_suggestions: data.improvement_suggestions || ''
    },
    experience_personalization: {
      interests: data.interests || [],
      time_preference: data.time_preference || [],
      available_days: data.available_days || [],
      networking_availability: data.networking_availability || 5,
      skills_to_share: data.skills_to_share || [],
      mentorship_topics: data.mentorship_topics || [],
      live_interest: data.live_interest || 0,
      priority_topics: data.priority_topics || []
    }
  };
};

// Add the missing mapQuickToProgress function (alias for compatibility)
export const mapQuickToProgress = mapToOnboardingProgress;

// Add the missing validateStepData function
export const validateStepData = (data: Partial<QuickOnboardingData>, step: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic validation based on step
  switch (step) {
    case 1:
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Nome é obrigatório');
      }
      if (!data.email || data.email.trim().length === 0) {
        errors.push('Email é obrigatório');
      }
      if (!data.whatsapp || data.whatsapp.trim().length === 0) {
        errors.push('WhatsApp é obrigatório');
      }
      break;
    case 2:
      if (!data.how_found_us || data.how_found_us.trim().length === 0) {
        errors.push('Como nos conheceu é obrigatório');
      }
      break;
    case 3:
      if (!data.primary_goal || data.primary_goal.trim().length === 0) {
        errors.push('Objetivo principal é obrigatório');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
