
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
    
    // Verificação de segurança para evitar processamentos com dados inválidos
    if (!userId) {
      console.error('ID de usuário inválido ao processar perfil');
      return null;
    }
    
    // Tentar buscar perfil existente
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrar perfil, tentar criar um novo
    if (!profile && email) {
      console.log(`Nenhum perfil encontrado. Tentando criar um novo para ${email}`);
      profile = await createUserProfileIfNeeded(userId, email, name || 'Usuário');
      
      // Verificação adicional para garantir que temos um perfil
      if (!profile) {
        console.log('Criação de perfil falhou, criando perfil local temporário');
        // Criar um perfil local temporário para evitar bloqueio da aplicação
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
    
    // Verifica se o perfil foi carregado
    if (profile) {
      console.log(`Perfil processado com sucesso: ${profile.id}, role: ${profile.role}`);
    } else {
      console.error(`Não foi possível carregar ou criar perfil para ${userId}`);
      // Criar perfil mínimo para não bloquear a aplicação
      if (email) {
        profile = {
          id: userId,
          email: email,
          name: name || 'Usuário',
          role: email.includes('admin') || email.includes('@viverdeia.ai') ? 'admin' : 'member',
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
    // Retorna null em caso de erro para evitar travamento da aplicação
    return null;
  }
};
