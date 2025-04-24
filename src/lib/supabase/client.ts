
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificar se as chaves existem
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Credenciais do Supabase não encontradas. Verifique as variáveis de ambiente.');
}

// Criar cliente Supabase com as configurações corretas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Tentativa simples de fazer uma consulta
    const { error } = await supabase.from('_health').select('*').limit(1);
    return { success: !error, error };
  } catch (err) {
    console.error('Erro ao verificar conexão com Supabase:', err);
    return { success: false, error: err };
  }
};

// Exportar cliente para uso em toda a aplicação
export default supabase;
