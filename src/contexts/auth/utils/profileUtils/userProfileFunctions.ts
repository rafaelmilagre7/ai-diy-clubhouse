
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
      birth_date: data.birth_date || undefined,
      curiosity: data.curiosity || undefined,
      business_sector: data.business_sector || undefined,
      position: data.position || undefined,
      primary_goal: data.primary_goal || undefined,
      weekly_availability: data.weekly_availability || undefined,
      weekly_learning_time: data.weekly_learning_time || undefined,
      networking_interests: data.networking_interests || undefined,
      nps_score: data.nps_score || undefined,
      country: data.country || undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      phone: data.phone || undefined,
      phone_country_code: data.phone_country_code || undefined,
      linkedin: data.linkedin || undefined,
      instagram: data.instagram || undefined,
      current_position: data.current_position || undefined,
      accepts_marketing: data.accepts_marketing === true || data.accepts_marketing === 'true',
      accepts_case_study: data.accepts_case_study === true || data.accepts_case_study === 'true',
      company_website: data.company_website || undefined,
      has_implemented_ai: data.has_implemented_ai === true || data.has_implemented_ai === 'true',
      ai_tools_used: data.ai_tools_used || undefined,
      daily_tools: data.daily_tools || undefined,
      who_will_implement: data.who_will_implement || undefined,
      implementation_timeline: data.implementation_timeline || undefined,
      team_size: data.team_size || undefined,
      annual_revenue: data.annual_revenue || undefined,
      company_size: data.company_size || undefined,
      ai_knowledge_level: data.ai_knowledge_level || undefined,
      business_challenges: data.business_challenges || undefined,
      main_objective: data.main_objective || undefined,
      area_to_impact: data.area_to_impact || undefined,
      expected_result_90_days: data.expected_result_90_days || undefined,
      ai_implementation_budget: data.ai_implementation_budget || undefined,
      content_preference: data.content_preference || undefined,
      wants_networking: data.wants_networking === true || data.wants_networking === 'true',
      best_days: data.best_days || undefined,
      best_periods: data.best_periods || undefined,
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

    return data as UserProfile;
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

    return data as UserProfile;
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
