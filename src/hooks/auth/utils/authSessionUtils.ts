
import { fetchUserProfile, createUserProfileIfNeeded } from '@/contexts/auth/utils/profileUtils';

/**
 * Process user profile after authentication
 * Returns a profile object or null if processing fails
 */
export const processUserProfile = async (
  userId: string,
  email: string | null | undefined,
  name?: string | null
): Promise<any> => {
  try {
    console.log(`Processando perfil para usuário ${userId}, email: ${email || 'não disponível'}`);
    
    // Tentar buscar perfil existente
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrar perfil, tentar criar um novo
    if (!profile && email) {
      console.log(`Nenhum perfil encontrado. Tentando criar um novo para ${email}`);
      profile = await createUserProfileIfNeeded(userId, email, name || 'Usuário');
    }
    
    // Verifica se o perfil foi carregado
    if (profile) {
      console.log(`Perfil processado com sucesso: ${profile.id}, role: ${profile.role}`);
    } else {
      console.error(`Não foi possível carregar ou criar perfil para ${userId}`);
    }
    
    return profile;
  } catch (error) {
    console.error('Erro ao processar perfil de usuário:', error);
    // Retorna null em caso de erro para evitar travamento da aplicação
    return null;
  }
};
