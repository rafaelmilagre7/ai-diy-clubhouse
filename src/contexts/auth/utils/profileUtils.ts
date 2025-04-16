
import { supabase, UserProfile, UserRole } from '@/lib/supabase';

// Fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`Buscando perfil para usuário: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Para erro de recursão infinita da política, trate de forma especial
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
    
    // Se o erro for de recursão infinita, não propague o erro para permitir criação alternativa
    if (error instanceof Error && error.message.includes('infinite recursion')) {
      return null;
    }
    
    throw error;
  }
};

// Cria perfil para usuário caso não exista
export const createUserProfileIfNeeded = async (
  userId: string, 
  email: string, 
  name: string = 'Usuário'
): Promise<UserProfile | null> => {
  try {
    // Determinar o papel correto com base no email
    const isAdmin = email === 'admin@teste.com' || 
                    email === 'admin@viverdeia.ai' || 
                    email.endsWith('@viverdeia.ai');
    
    const userRole: UserRole = isAdmin ? 'admin' : 'member';
    
    console.log(`Tentando criar perfil para ${email} com papel ${userRole}`);
    
    // Usar inserção com tratamento de conflito para evitar duplicações
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
      // Se não conseguir inserir devido a políticas, tente usar a função RPC criada no SQL
      if (insertError.message.includes('policy') || insertError.message.includes('permission denied')) {
        console.warn('Erro de política ao criar perfil. Continuando sem perfil:', insertError);
        // Retorne um perfil mínimo para permitir uso da aplicação
        return {
          id: userId,
          email,
          name,
          role: userRole,
          avatar_url: null,
          company_name: null,
          industry: null,
          created_at: new Date().toISOString()
        };
      }
      
      console.error('Erro ao criar perfil:', insertError);
      throw insertError;
    }
    
    console.log('Perfil criado com sucesso:', newProfile);
    return newProfile as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    // Retorne um perfil mínimo em caso de erro para não bloquear a aplicação
    const isAdmin = email === 'admin@teste.com' || 
                    email === 'admin@viverdeia.ai' || 
                    email.endsWith('@viverdeia.ai');
    
    const userRole: UserRole = isAdmin ? 'admin' : 'member';
    
    return {
      id: userId,
      email,
      name,
      role: userRole,
      avatar_url: null,
      company_name: null,
      industry: null,
      created_at: new Date().toISOString()
    };
  }
};
