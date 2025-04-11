
import { supabase, UserProfile } from '@/lib/supabase';

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
      // Verifica se é um erro de recursão infinita em políticas RLS
      if (error.message && error.message.includes('infinite recursion detected in policy')) {
        console.error('Erro de recursão infinita em políticas RLS: ', error);
        throw new Error('Existe um problema com as políticas de segurança no Supabase. Por favor, verifique as políticas RLS na tabela "profiles".');
      }
      
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
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
    // Primeiro verifica se já existe um perfil
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (!fetchError && existingProfile) {
      console.log('Perfil já existe para o usuário');
      return existingProfile as UserProfile;
    }
    
    // Determina se deve ser admin baseado no email
    const isAdmin = email.endsWith('@viverdeia.ai') || 
                    email === 'admin@teste.com' ||
                    email === 'admin@viverdeia.ai';
    
    const userRole = isAdmin ? 'admin' : 'member';
    
    // Se não existe ou houve erro, tenta criar
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        name,
        role: userRole
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Erro ao criar perfil:', insertError);
      throw insertError;
    }
    
    console.log('Perfil criado com sucesso:', newProfile);
    return newProfile as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    return null;
  }
};
