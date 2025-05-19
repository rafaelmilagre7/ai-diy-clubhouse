
import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/lib/supabase/types';

// Função para buscar perfil de usuário
export const fetchUserProfile = async (userId: string) => {
  try {
    if (!userId) {
      return { data: null, error: new Error('ID de usuário não fornecido') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(*)')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Certifique-se de que o perfil tenha todas as propriedades necessárias
    const profile: UserProfile = {
      ...data,
      // Garante que o perfil tenha o nome definido de maneira consistente
      name: data.name || data.full_name || data.username || 'Usuário',
    };
    
    return { data: profile, error: null };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return { data: null, error };
  }
};

// Função para atualizar perfil de usuário
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    if (!userId) {
      return { data: null, error: new Error('ID de usuário não fornecido') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { data: null, error };
  }
};
