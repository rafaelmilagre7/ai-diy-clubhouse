
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/supabase/types';

// Função para buscar perfil de usuário
export const fetchUserProfile = async (userId: string) => {
  try {
    if (!userId) {
      return { data: null, error: new Error('ID de usuário não fornecido') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return { data: null, error };
  }
};

// Outras funções relacionadas ao perfil do usuário
