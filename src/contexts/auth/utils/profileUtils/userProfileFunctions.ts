
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';

/**
 * Fetches user profile with complete data structure
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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

    if (!data) {
      return null;
    }

    // Ensure complete UserProfile structure
    const profile: UserProfile = {
      id: data.id || '',
      email: data.email || '',
      name: data.name || '',
      role_id: data.role_id || '',
      avatar_url: data.avatar_url || '',
      company_name: data.company_name || '',
      industry: data.industry || '',
      role: data.role || 'member',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at || '',
      referrals_count: data.referrals_count || 0,
      successful_referrals_count: data.successful_referrals_count || 0,
      whatsapp_number: data.whatsapp_number || null,
      user_roles: (data as any).user_roles || null
    };

    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

/**
 * Creates a user profile if it doesn't exist
 */
export const createUserProfileIfNeeded = async (userId: string, email: string, name?: string): Promise<UserProfile | null> => {
  try {
    // Check if profile already exists
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Get default member role
    const { data: memberRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id, name')
      .eq('name', 'member')
      .single();

    if (roleError) {
      console.error('Error fetching member role:', roleError);
      return null;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: email,
        name: name || email.split('@')[0],
        role_id: memberRole.id,
        avatar_url: '',
        company_name: '',
        industry: '',
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_completed: false,
        onboarding_completed_at: '',
        referrals_count: 0,
        successful_referrals_count: 0,
        whatsapp_number: null
      }])
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
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    // Ensure complete UserProfile structure
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      name: data.name,
      role_id: data.role_id,
      avatar_url: data.avatar_url || '',
      company_name: data.company_name || '',
      industry: data.industry || '',
      role: data.role || 'member',
      created_at: data.created_at,
      updated_at: data.updated_at || new Date().toISOString(),
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at || '',
      referrals_count: data.referrals_count || 0,
      successful_referrals_count: data.successful_referrals_count || 0,
      whatsapp_number: data.whatsapp_number || null,
      user_roles: (data as any).user_roles || { id: memberRole.id, name: memberRole.name }
    };

    return profile;
  } catch (error) {
    console.error('Error in createUserProfileIfNeeded:', error);
    return null;
  }
};
