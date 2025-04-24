
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEzMzAxODUsImV4cCI6MTk5NjkwNjE4NX0.wOitnlkIsux5t0mdSOzw6QvpmV9ryJmhwxQ4eI-w4kQ';

// Para desenvolvimento, mostrar URL e chave no console
if (process.env.NODE_ENV !== 'production') {
  console.log('Supabase URL:', supabaseUrl);
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

// Exportar cliente para uso em toda a aplicação
export default supabase;
