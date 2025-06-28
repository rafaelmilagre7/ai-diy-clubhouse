
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userProfile';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map the database response to our UserProfile type with safe property access
    const profile: UserProfile = {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      avatar_url: data.avatar_url || '',
      company_name: data.company_name || '',
      industry: data.industry || '',
      role_id: data.role_id || '',
      role: data.role || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at,
      birth_date: (data as any).birth_date || undefined,
      curiosity: (data as any).curiosity || undefined,
      business_sector: (data as any).business_sector || undefined,
      position: (data as any).position || undefined,
      primary_goal: (data as any).primary_goal || undefined,
      weekly_availability: (data as any).weekly_availability || undefined,
      weekly_learning_time: (data as any).weekly_learning_time || undefined,
      networking_interests: (data as any).networking_interests || undefined,
      nps_score: (data as any).nps_score || undefined,
      country: (data as any).country || undefined,
      state: (data as any).state || undefined,
      city: (data as any).city || undefined,
      phone: (data as any).phone || undefined,
      phone_country_code: (data as any).phone_country_code || undefined,
      linkedin: (data as any).linkedin || undefined,
      instagram: (data as any).instagram || undefined,
      current_position: (data as any).current_position || undefined,
      accepts_marketing: (data as any).accepts_marketing === true || (data as any).accepts_marketing === 'true',
      accepts_case_study: (data as any).accepts_case_study === true || (data as any).accepts_case_study === 'true',
      company_website: (data as any).company_website || undefined,
      has_implemented_ai: (data as any).has_implemented_ai === true || (data as any).has_implemented_ai === 'true',
      ai_tools_used: (data as any).ai_tools_used || undefined,
      daily_tools: (data as any).daily_tools || undefined,
      who_will_implement: (data as any).who_will_implement || undefined,
      implementation_timeline: (data as any).implementation_timeline || undefined,
      team_size: (data as any).team_size || undefined,
      annual_revenue: (data as any).annual_revenue || undefined,
      company_size: (data as any).company_size || undefined,
      ai_knowledge_level: (data as any).ai_knowledge_level || undefined,
      business_challenges: (data as any).business_challenges || undefined,
      main_objective: (data as any).main_objective || undefined,
      area_to_impact: (data as any).area_to_impact || undefined,
      expected_result_90_days: (data as any).expected_result_90_days || undefined,
      ai_implementation_budget: (data as any).ai_implementation_budget || undefined,
      content_preference: (data as any).content_preference || undefined,
      wants_networking: (data as any).wants_networking === true || (data as any).wants_networking === 'true',
      best_days: (data as any).best_days || undefined,
      best_periods: (data as any).best_periods || undefined,
      user_roles: data.user_roles
    };

    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const getUserProfile = fetchUserProfile;

export const createUserProfile = async (userId: string, email: string, name?: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        name: name || null,
        onboarding_completed: false
      })
      .select(`
        *,
        user_roles (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data as any;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (userId: string, email: string, name?: string): Promise<UserProfile | null> => {
  let profile = await fetchUserProfile(userId);
  
  if (!profile) {
    profile = await createUserProfile(userId, email, name);
  }
  
  return profile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(`
        *,
        user_roles (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data as any;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

export const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserProfile:', error);
    return false;
  }
};
