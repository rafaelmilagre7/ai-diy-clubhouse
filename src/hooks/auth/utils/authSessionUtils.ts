
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

// Process user profile with efficient profile fetching
export const processUserProfile = async (
  userId: string,
  email?: string | null,
  name?: string | null
): Promise<UserProfile | null> => {
  try {
    console.log(`Processing profile for user: ${userId}`);
    
    // Fetch profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    if (profile) {
      console.log("Profile found:", profile.id);
      return profile as UserProfile;
    }
    
    // If no profile exists, create one
    const defaultProfile: Partial<UserProfile> = {
      id: userId,
      email: email || '',
      name: name || 'Novo Membro',
      role: 'member',
    };
    
    console.log("Creating new profile:", defaultProfile);
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating profile:", createError);
      return null;
    }
    
    return newProfile as UserProfile;
  } catch (error) {
    console.error("Profile processing error:", error);
    return null;
  }
};
