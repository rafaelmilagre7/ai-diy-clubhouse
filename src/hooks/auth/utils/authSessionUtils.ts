
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';

export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

export const processUserProfile = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar_url: data.avatar_url || '',
    company_name: data.company_name || '',
    industry: data.industry || '',
    role_id: data.role_id,
    role: data.role,
    created_at: data.created_at,
    updated_at: data.updated_at || new Date().toISOString(),
    onboarding_completed: data.onboarding_completed || false,
    onboarding_completed_at: data.onboarding_completed_at || '',
    referrals_count: data.referrals_count || 0,
    successful_referrals_count: data.successful_referrals_count || 0,
    whatsapp_number: data.whatsapp_number,
    user_roles: data.user_roles
  };
};

export const validateUserSession = (session: any): boolean => {
  return session && session.user && session.user.id;
};

export const clearProfileCache = (): void => {
  // Implementation for clearing profile cache if needed
  console.log('Profile cache cleared');
};
