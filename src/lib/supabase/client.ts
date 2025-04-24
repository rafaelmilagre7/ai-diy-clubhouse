
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Configuração do Supabase
const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

// Criar cliente Supabase com tratamento de erros e configurações de persistência
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error("Erro de conexão Supabase:", err);
        if (navigator.onLine === false) {
          toast.error("Erro de conexão com a internet", {
            description: "Verifique sua conexão e tente novamente"
          });
        }
        throw err;
      });
    }
  }
});

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Verificar se existe a tabela _health
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error("Erro ao verificar conexão:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao verificar conexão com Supabase:', err);
    return { success: false, error: err };
  }
};

// Exportar cliente para uso em toda a aplicação
export default supabase;
