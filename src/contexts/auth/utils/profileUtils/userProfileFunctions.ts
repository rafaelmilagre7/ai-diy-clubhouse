
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { determineRoleFromEmail } from './roleValidation';

/**
 * Fetch user profile from Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`Buscando perfil para usuário: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Handle infinite recursion policy error specially
      if (error.message.includes('infinite recursion')) {
        console.warn('Detectada recursão infinita na política. Tentando criar perfil como solução alternativa.');
        return null;
      }
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    console.log('Perfil encontrado:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    
    // If error is infinite recursion, don't propagate to allow alternative profile creation
    if (error instanceof Error && error.message.includes('infinite recursion')) {
      return null;
    }
    
    throw error;
  }
};

/**
 * Create profile for user if it doesn't exist
 */
export const createUserProfileIfNeeded = async (
  userId: string, 
  email: string, 
  name: string = 'Usuário'
): Promise<UserProfile | null> => {
  try {
    // Determine correct role based on email
    const userRole: UserRole = determineRoleFromEmail(email);
    
    console.log(`Tentando criar perfil para ${email} com papel ${userRole}`);
    
    // Use upsert with conflict handling to avoid duplications
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        name,
        role: userRole,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (insertError) {
      // If insertion fails due to policies, try using RPC function created in SQL
      if (insertError.message.includes('policy') || insertError.message.includes('permission denied')) {
        console.warn('Erro de política ao criar perfil. Continuando sem perfil:', insertError);
        // Return minimal profile to allow application use
        return createFallbackProfile(userId, email, name, userRole);
      }
      
      console.error('Erro ao criar perfil:', insertError);
      throw insertError;
    }
    
    console.log('Perfil criado com sucesso:', newProfile);
    return newProfile as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    // Return minimal profile in case of error to not block application
    const userRole: UserRole = determineRoleFromEmail(email);
    return createFallbackProfile(userId, email, name, userRole);
  }
};

/**
 * Creates a minimal fallback profile when database operations fail
 */
const createFallbackProfile = (
  userId: string, 
  email: string, 
  name: string, 
  role: UserRole
): UserProfile => {
  return {
    id: userId,
    email,
    name,
    role,
    avatar_url: null,
    company_name: null,
    industry: null,
    created_at: new Date().toISOString()
  };
};
