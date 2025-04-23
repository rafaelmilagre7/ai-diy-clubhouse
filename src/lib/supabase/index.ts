import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
export * from '@/types/supabaseTypes';

// Usando constantes ao invés de variáveis de ambiente
const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    fetch: (url, options) => {
      const controller = new AbortController();
      const { signal } = controller;
      
      // Definir timeout para requisições
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
      
      return fetch(url, { ...options, signal })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Exportar funções de utilidade para operações comuns
export const fetchSolutionById = async (id: string) => {
  try {
    console.log(`Buscando solução com ID: ${id}`);
    
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar solução:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Solução não encontrada');
    }

    console.log('Solução encontrada:', data.title);
    return data;
  } catch (error) {
    console.error('Erro na função fetchSolutionById:', error);
    throw error;
  }
};

export const fetchSolutionResources = async (solutionId: string) => {
  const { data, error } = await supabase
    .from('solution_resources')
    .select('*')
    .eq('solution_id', solutionId);

  if (error) {
    console.error('Error fetching solution resources:', error);
    throw error;
  }

  return data;
};

export const fetchSolutionTools = async (solutionId: string) => {
  const { data, error } = await supabase
    .from('solution_tools')
    .select('*')
    .eq('solution_id', solutionId);

  if (error) {
    console.error('Error fetching solution tools:', error);
    throw error;
  }

  return data;
};
