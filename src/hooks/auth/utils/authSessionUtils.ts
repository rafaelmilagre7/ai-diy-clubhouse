
import { fetchUserProfile, createUserProfileIfNeeded } from '@/contexts/auth/utils/profileUtils';
import { UserProfile } from '@/lib/supabase';

/**
 * Process user profile after authentication
 * Returns a profile object or null if processing fails
 */
export const processUserProfile = async (
  userId: string,
  email: string | null | undefined,
  name?: string | null
): Promise<UserProfile | null> => {
  try {
    console.log(`Processando perfil para usuário ${userId}, email: ${email || 'não disponível'}`);
    
    // Security check to avoid processing with invalid data
    if (!userId) {
      console.error('ID de usuário inválido ao processar perfil');
      return null;
    }
    
    // Try to fetch existing profile
    let profile = await fetchUserProfile(userId);
    
    // If no profile is found, try to create a new one
    if (!profile && email) {
      console.log(`Nenhum perfil encontrado. Tentando criar um novo para ${email}`);
      profile = await createUserProfileIfNeeded(userId, email, name || 'Usuário');
      
      // Additional check to ensure we have a profile
      if (!profile) {
        console.log('Criação de perfil falhou, criando perfil local temporário');
        // Create a temporary local profile to avoid blocking the application
        profile = {
          id: userId,
          email: email,
          name: name || 'Usuário',
          role: email?.includes('admin') || email?.includes('@viverdeia.ai') ? 'admin' : 'member',
          created_at: new Date().toISOString(),
          avatar_url: null,
          company_name: null,
          industry: null
        };
      }
    }
    
    // Check if profile was loaded
    if (profile) {
      console.log(`Perfil processado com sucesso: ${profile.id}, role: ${profile.role}`);
    } else {
      console.error(`Não foi possível carregar ou criar perfil para ${userId}`);
      // Create minimal profile to not block application
      if (email) {
        profile = {
          id: userId,
          email: email,
          name: name || 'Usuário',
          role: email.includes('admin') || email?.includes('@viverdeia.ai') ? 'admin' : 'member',
          created_at: new Date().toISOString(),
          avatar_url: null,
          company_name: null,
          industry: null
        };
        console.log('Criado perfil local temporário:', profile);
      }
    }
    
    return profile;
  } catch (error) {
    console.error('Erro ao processar perfil de usuário:', error);
    // Return null in case of error to avoid application freezing
    return null;
  }
};
