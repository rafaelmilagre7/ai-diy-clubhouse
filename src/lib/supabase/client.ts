
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

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
