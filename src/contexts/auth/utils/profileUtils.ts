
import { supabase, UserProfile } from '@/lib/supabase';
import { UserRole } from '@/types/supabaseTypes';
import { determineRoleFromEmail, validateUserRole } from './profileUtils/roleValidation';

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
      // Garantindo que profile.role seja do tipo UserRole antes de passar para validateUserRole
      const currentRole = profile.role as UserRole;
      const validatedRole = await validateUserRole(profile.id, currentRole, email);
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
 * Busca o perfil de um usuário existente
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
      if (error.message.includes('infinite recursion')) {
        console.warn('Detectada recursão infinita na política. Tentando criar perfil como solução alternativa.');
        return null;
      }
      console.error('Erro ao buscar perfil de usuário:', error);
      return null;
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    console.log('Perfil encontrado:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    return null;
  }
};

/**
 * Cria um perfil para o usuário se não existir
 */
export const createUserProfileIfNeeded = async (
  userId: string, 
  email: string, 
  name: string = 'Usuário'
): Promise<UserProfile | null> => {
  try {
    // Determinar o papel correto com base no email
    const userRole: UserRole = determineRoleFromEmail(email);
    
    console.log(`Criando perfil para ${email} com papel ${userRole}`);
    
    // Usar upsert com tratamento de conflito para evitar duplicações
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
      // Se a inserção falhar devido a políticas, usar um perfil alternativo
      console.error('Erro ao criar perfil:', insertError);
      return createFallbackProfile(userId, email, name, userRole);
    }
    
    console.log('Perfil criado com sucesso:', newProfile);
    
    // Atualizar metadados do usuário em segundo plano com o papel
    try {
      await supabase.auth.updateUser({
        data: { role: userRole }
      });
    } catch (error) {
      console.error('Erro ao atualizar metadados do usuário:', error);
    }
    
    return newProfile as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    // Retornar um perfil mínimo em caso de erro para não bloquear a aplicação
    const userRole: UserRole = determineRoleFromEmail(email);
    return createFallbackProfile(userId, email, name, userRole);
  }
};

/**
 * Cria um perfil alternativo mínimo quando operações de banco de dados falham
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
