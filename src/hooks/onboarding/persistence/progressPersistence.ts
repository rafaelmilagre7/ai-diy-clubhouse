
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";

// Buscar progresso do onboarding
export const fetchOnboardingProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
};

export const createInitialOnboardingProgress = async (user: any) => {
  const userName = user?.user_metadata?.name || '';
  const userEmail = user?.email || '';

  const initialData = {
    user_id: user?.id,
    completed_steps: [],
    current_step: 'personal',
    is_completed: false,
    personal_info: {
      name: userName,
      email: userEmail,
    },
    professional_info: {},
    business_data: {},
    ai_experience: {},
    business_goals: {},
    experience_personalization: {},
    complementary_info: {},
    industry_focus: {},
    resources_needs: {},
    team_info: {},
    implementation_preferences: {},
    company_name: "",
    company_size: "",
    company_sector: "",
    company_website: "",
    current_position: "",
    annual_revenue: ""
  };

  const { data, error } = await supabase
    .from("onboarding_progress")
    .insert(initialData)
    .select()
    .single();

  return { data, error };
};

export const updateOnboardingProgress = async (progressId: string, updates: Partial<OnboardingProgress>) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .update(updates)
    .eq("id", progressId)
    .select()
    .single();

  return { data, error };
};

export const refreshOnboardingProgress = async (progressId: string) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("id", progressId)
    .single();
  return { data, error };
};

