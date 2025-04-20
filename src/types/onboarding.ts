
export interface OnboardingData {
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
  business_goals: {
    primary_goal?: string;
    expected_outcomes?: string[];
    timeline?: string;
  };
  ai_experience: {
    knowledge_level?: string;
    previous_tools?: string[];
    challenges?: string[];
  };
  industry_focus: {
    sector?: string;
    target_market?: string;
    main_challenges?: string[];
  };
  resources_needs: {
    budget_range?: string;
    team_size?: string;
    tech_stack?: string[];
  };
  team_info: {
    decision_makers?: string[];
    technical_expertise?: string;
    training_needs?: string[];
  };
  implementation_preferences: {
    priority_areas?: string[];
    implementation_speed?: string;
    support_level?: string;
  };
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  personal_info: OnboardingData['personal_info'];
  business_goals: OnboardingData['business_goals'];
  ai_experience: OnboardingData['ai_experience'];
  industry_focus: OnboardingData['industry_focus'];
  resources_needs: OnboardingData['resources_needs'];
  team_info: OnboardingData['team_info'];
  implementation_preferences: OnboardingData['implementation_preferences'];
}
