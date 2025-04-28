
import { supabase } from '@/lib/supabase';

/**
 * Processa ou cria o perfil do usuário após login bem-sucedido
 * @param userId ID do usuário autenticado
 * @param email Email do usuário
 * @param name Nome do usuário (opcional)
 * @returns O perfil do usuário processado ou criado
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined,
  name?: string
) => {
  try {
    console.log(`Processando perfil para usuário ${userId}`);
    
    // Buscar perfil existente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
      console.error('Erro ao buscar perfil:', fetchError);
      throw fetchError;
    }
    
    // Se o perfil existir, retornar
    if (existingProfile) {
      console.log('Perfil existente encontrado:', existingProfile);
      return existingProfile;
    }
    
    console.log('Perfil não encontrado, criando novo perfil');
    
    // Determinar papel (role) do usuário
    const isAdmin = email?.endsWith('@viverdeia.ai') || email === 'admin@teste.com';
    const role = isAdmin ? 'admin' : 'member';
    
    // Criar perfil se não existir
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email || '',
          name: name || 'Usuário',
          role: role
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao criar perfil:', insertError);
      throw insertError;
    }
    
    console.log('Novo perfil criado:', newProfile);
    return newProfile;
    
  } catch (error) {
    console.error('Erro ao processar perfil:', error);
    throw error;
  }
};
