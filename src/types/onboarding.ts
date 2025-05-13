export interface OnboardingData {
  // 1. Dados Pessoais
  personal_info: {
    name?: string;
    role?: string;
    company_size?: string;
    email?: string;
    phone?: string;
    ddi?: string;
    linkedin?: string;
    instagram?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
  };
  // 2. Dados Profissionais 
  professional_info: {
    company_name?: string;
    company_size?: string;
    company_sector?: string;
    company_website?: string;
    current_position?: string;
    annual_revenue?: string;
    metadata?: Record<string, any>;
  };
  // 3. Contexto do negócio
  business_context: {
    business_model?: string;
    business_challenges?: string[];
    short_term_goals?: string[];
    medium_term_goals?: string[];
    important_kpis?: string[];
    additional_context?: string;
  };
  // 4. Objetivos de negócio / metas
  business_goals: {
    primary_goal?: string;
    expected_outcomes?: string[];
    expected_outcome_30days?: string; // Campo individual para verificação
    timeline?: string;
    priority_solution_type?: string;
    how_implement?: string;
    week_availability?: string;
    live_interest?: number;
    content_formats?: string[];
  };
  // 5. Experiência com IA
  ai_experience: {
    knowledge_level?: string;
    previous_tools?: string[];
    has_implemented?: string; // "sim" | "nao" ou "true" | "false"
    desired_ai_areas?: string[]; // Agora array
    completed_formation?: boolean;
    is_member_for_month?: boolean;
    nps_score?: number;
    improvement_suggestions?: string;
  };
  // 6. Personalização da experiência
  experience_personalization: {
    interests?: string[];
    time_preference?: string[];
    available_days?: string[];
    networking_availability?: number;
    skills_to_share?: string[];
    mentorship_topics?: string[];
  };
  // 7. Complementares
  complementary_info: {
    how_found_us?: string;
    referred_by?: string;
    authorize_case_usage?: boolean;
    interested_in_interview?: boolean;
    priority_topics?: string[];
  };
  
  // Campos para Formação
  formation_data?: {
    current_occupation?: string;
    interests?: string[];
    learning_goals?: string[];
    preferred_learning_style?: string[];
    availability_hours_per_week?: number;
    previous_courses?: string[];
    expectations?: string;
    how_heard_about?: string;
  };
  
  // Campo para identificar o tipo de onboarding
  onboarding_type?: 'club' | 'formacao';
  
  // Campos diretos para compatibilidade com as verificações do builder
  how_found_us?: string;
  referred_by?: string;
  authorize_case_usage?: boolean;
  interested_in_interview?: boolean;
  priority_topics?: string[];

  // Campos adicionais necessários para compatibilidade
  industry_focus?: any;
  resources_needs?: any;
  team_info?: any;
  implementation_preferences?: any;
}

export interface PersonalInfoData {
  name: string;
  email: string;
  phone: string;
  ddi?: string;
  linkedin: string;
  instagram: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  personal_info: OnboardingData['personal_info'];
  professional_info: OnboardingData['professional_info'];
  business_context?: OnboardingData['business_context'];
  business_goals: OnboardingData['business_goals'];
  ai_experience: OnboardingData['ai_experience'];
  experience_personalization: OnboardingData['experience_personalization'];
  complementary_info: OnboardingData['complementary_info'];
  formation_data?: OnboardingData['formation_data']; // Adicionando os dados de formação
  onboarding_type?: 'club' | 'formacao'; // Adicionando o tipo de onboarding
  industry_focus?: OnboardingData['industry_focus'];
  resources_needs?: OnboardingData['resources_needs'];
  team_info?: OnboardingData['team_info'];
  implementation_preferences?: OnboardingData['implementation_preferences'];
  
  // Campos legacy que precisam ser mantidos para compatibilidade
  business_data?: any;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;

  // Propriedades para trilhas futuras
  trail_solutions?: any[];
  trail_generated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingStepProps {
  onSubmit: (stepId: string, data: any) => Promise<void>;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
  personalInfo?: OnboardingData['personal_info'];
}

export interface OnboardingStep {
  id: string;
  title: string;
  section: string;
  path: string;
}

export type ProfessionalDataInput = {
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
};

// Definição das etapas do onboarding de formação
export interface FormationOnboardingStep extends OnboardingStep {
  forFormation: boolean; // indica se a etapa é específica para formação
}

// Definição das etapas do onboarding completo, incluindo etapas específicas para formação
export type CompleteOnboardingStep = OnboardingStep & { 
  forFormation?: boolean;
  forClub?: boolean;
};
