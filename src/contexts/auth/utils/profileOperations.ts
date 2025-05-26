import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { determineRoleFromEmail, validateUserRole } from './roleValidation';

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
      return null; // Retornar null ao invés de lançar erro
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    console.log('Perfil encontrado:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null; // Retornar null ao invés de lançar erro
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
        created_at: new Date().toISOString(),
        avatar_url: null,
        company_name: null,
        industry: null
      })
      .select()
      .single();
      
    if (insertError) {
      // If insertion fails due to policies, try using RPC function created in SQL
      if (insertError.message.includes('policy') || insertError.message.includes('permission denied')) {
        console.warn('Erro de política ao criar perfil. Continuando com perfil alternativo:', insertError);
        // Return minimal profile to allow application use
        return createFallbackProfile(userId, email, name, userRole);
      }
      
      console.error('Erro ao criar perfil:', insertError);
      return createFallbackProfile(userId, email, name, userRole);
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
  console.log(`Criando perfil alternativo para ${email} com papel ${role}`);
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

/**
 * Processa o perfil do usuário durante a inicialização da sessão
 * Busca o perfil existente ou cria um novo se necessário
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.error("ID de usuário não fornecido para processamento de perfil");
      return null;
    }
    
    // Tentar buscar perfil existente
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrou perfil, criar um novo
    if (!profile) {
      console.log("Nenhum perfil encontrado, criando novo perfil para", email);
      profile = await createUserProfileIfNeeded(userId, email || "", name || "Usuário");
      
      if (!profile) {
        console.error("Falha ao criar perfil para", email);
        return null;
      }
    }
    
    // Verificar e atualizar o papel do usuário se necessário
    if (profile.role) {
      const validatedRole = await validateUserRole(profile.id, profile.role, email);
      if (validatedRole !== profile.role) {
        profile.role = validatedRole;
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    return null;
  }
};

/**
 * Inicializa um novo perfil com valores padrão
 */
export const initializeNewProfile = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    const role = determineRoleFromEmail(email);
    
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao inicializar novo perfil:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao inicializar perfil:", error);
    return null;
  }
};
