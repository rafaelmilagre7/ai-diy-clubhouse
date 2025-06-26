
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';
import { ENV_CONFIG } from '@/config/env-validation';

// Usar configuração validada
const supabaseUrl = ENV_CONFIG.SUPABASE_URL;
const supabaseAnonKey = ENV_CONFIG.SUPABASE_ANON_KEY;

// Validação adicional
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase incompleta. Verifique as variáveis de ambiente.');
}

console.log('🔗 Conectando ao Supabase:', {
  url: supabaseUrl.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// CORREÇÃO: Tipo UserProfile usando a tabela 'profiles' correta
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: any;
    is_system?: boolean;
  } | null;
};

// Função para obter perfil do usuário com role join
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    return null;
  }
};

// Re-exportar o cliente
export default supabase;
