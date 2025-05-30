
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';

export const mapQuickToProgress = (quick: QuickOnboardingData): Partial<OnboardingProgress> => {
  return {
    personal_info: {
      name: quick.name,
      email: quick.email,
      phone: quick.whatsapp,
      ddi: quick.country_code,
      country: quick.country,
      state: quick.state,
      city: quick.city,
      timezone: quick.timezone,
      birth_date: quick.birth_date,
      linkedin: quick.linkedin_url,
      instagram: quick.instagram_url,
      role: quick.role,
      company_size: quick.company_size
    },
    professional_info: {
      company_name: quick.company_name,
      company_size: quick.company_size,
      company_sector: quick.company_segment,
      company_website: quick.company_website,
      current_position: quick.role,
      annual_revenue: quick.annual_revenue_range
    },
    business_context: {
      business_model: quick.business_model,
      business_challenges: quick.business_challenges,
      short_term_goals: quick.short_term_goals,
      medium_term_goals: quick.medium_term_goals,
      important_kpis: quick.important_kpis,
      additional_context: quick.additional_context
    },
    business_goals: {
      primary_goal: quick.primary_goal,
      expected_outcomes: quick.expected_outcomes,
      expected_outcome_30days: quick.expected_outcome_30days,
      priority_solution_type: quick.priority_solution_type,
      how_implement: quick.how_implement,
      week_availability: quick.week_availability,
      content_formats: quick.content_formats,
      live_interest: quick.live_interest
    },
    ai_experience: {
      knowledge_level: quick.ai_knowledge_level,
      previous_tools: quick.previous_tools,
      has_implemented: quick.has_implemented,
      desired_ai_areas: quick.desired_ai_areas,
      completed_formation: quick.completed_formation,
      is_member_for_month: quick.is_member_for_month,
      nps_score: quick.nps_score,
      improvement_suggestions: quick.improvement_suggestions
    },
    experience_personalization: {
      interests: quick.interests,
      time_preference: quick.time_preference,
      available_days: quick.available_days,
      networking_availability: quick.networking_availability,
      skills_to_share: quick.skills_to_share,
      mentorship_topics: quick.mentorship_topics
    },
    complementary_info: {
      how_found_us: quick.how_found_us,
      referred_by: quick.referred_by,
      authorize_case_usage: quick.authorize_case_usage,
      interested_in_interview: quick.interested_in_interview,
      priority_topics: quick.priority_topics
    }
  };
};

export const mapProgressToQuick = (progress: OnboardingProgress): Partial<QuickOnboardingData> => {
  return {
    name: progress.personal_info?.name || '',
    email: progress.personal_info?.email || '',
    whatsapp: progress.personal_info?.phone || '',
    country_code: progress.personal_info?.ddi || '+55',
    birth_date: progress.personal_info?.birth_date,
    country: progress.personal_info?.country || '',
    state: progress.personal_info?.state || '',
    city: progress.personal_info?.city || '',
    timezone: progress.personal_info?.timezone || '',
    instagram_url: progress.personal_info?.instagram,
    linkedin_url: progress.personal_info?.linkedin,
    how_found_us: progress.complementary_info?.how_found_us || '',
    referred_by: progress.complementary_info?.referred_by,
    company_name: progress.professional_info?.company_name || '',
    role: progress.professional_info?.current_position || progress.personal_info?.role || '',
    company_size: progress.professional_info?.company_size || progress.personal_info?.company_size || '',
    company_segment: progress.professional_info?.company_sector || '',
    company_website: progress.professional_info?.company_website,
    annual_revenue_range: progress.professional_info?.annual_revenue || '',
    business_model: progress.business_context?.business_model || '',
    business_challenges: progress.business_context?.business_challenges || [],
    short_term_goals: progress.business_context?.short_term_goals,
    medium_term_goals: progress.business_context?.medium_term_goals,
    important_kpis: progress.business_context?.important_kpis,
    additional_context: progress.business_context?.additional_context,
    primary_goal: progress.business_goals?.primary_goal || '',
    expected_outcomes: progress.business_goals?.expected_outcomes,
    expected_outcome_30days: progress.business_goals?.expected_outcome_30days || '',
    priority_solution_type: progress.business_goals?.priority_solution_type,
    how_implement: progress.business_goals?.how_implement,
    week_availability: progress.business_goals?.week_availability,
    content_formats: progress.business_goals?.content_formats,
    live_interest: progress.business_goals?.live_interest,
    ai_knowledge_level: progress.ai_experience?.knowledge_level || '',
    previous_tools: progress.ai_experience?.previous_tools,
    has_implemented: progress.ai_experience?.has_implemented || '',
    desired_ai_areas: progress.ai_experience?.desired_ai_areas,
    completed_formation: progress.ai_experience?.completed_formation,
    is_member_for_month: progress.ai_experience?.is_member_for_month,
    nps_score: progress.ai_experience?.nps_score,
    improvement_suggestions: progress.ai_experience?.improvement_suggestions,
    interests: progress.experience_personalization?.interests,
    time_preference: progress.experience_personalization?.time_preference,
    available_days: progress.experience_personalization?.available_days,
    networking_availability: progress.experience_personalization?.networking_availability,
    skills_to_share: progress.experience_personalization?.skills_to_share,
    mentorship_topics: progress.experience_personalization?.mentorship_topics,
    authorize_case_usage: progress.complementary_info?.authorize_case_usage,
    interested_in_interview: progress.complementary_info?.interested_in_interview,
    priority_topics: progress.complementary_info?.priority_topics
  };
};

export const validateStepData = (data: QuickOnboardingData, step: number): boolean => {
  switch (step) {
    case 1:
      return !!(data.name?.trim() && data.email?.trim() && data.whatsapp?.trim() && data.country_code?.trim());
    case 2:
      return !!(data.country?.trim() && data.state?.trim() && data.city?.trim() && data.timezone?.trim());
    case 3:
      return !!(data.how_found_us?.trim() && (data.how_found_us !== 'indicacao' || data.referred_by?.trim()));
    case 4:
      return !!(data.company_name?.trim() && data.role?.trim() && data.company_size?.trim() && data.company_segment?.trim());
    case 5:
      return !!(data.business_model?.trim() && data.business_challenges?.length > 0);
    case 6:
      return !!(data.primary_goal?.trim() && data.expected_outcome_30days?.trim());
    case 7:
      return !!(data.ai_knowledge_level?.trim() && data.has_implemented?.trim());
    case 8:
      return true; // Personalização é opcional
    default:
      return false;
  }
};
