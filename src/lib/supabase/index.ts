
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
export * from '@/types/supabaseTypes';

// Usando constantes da configuração centralizada
import { supabaseConfig } from './config';

// Cliente Supabase com configurações para melhor diagnóstico
export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Função padronizada para buscar solução por ID, sem fallback
export const fetchSolutionById = async (id: string) => {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('ID da solução inválido ou não especificado');
  }
  
  // Buscar a solução pelo ID específico
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  if (!data) {
    throw new Error(`Solução com ID ${id} não encontrada`);
  }
  
  return data;
};

// Função para verificar existência de solução
export const checkSolutionExists = async (id: string): Promise<boolean> => {
  try {
    if (!id) return false;
    
    const { data, error } = await supabase
      .from('solutions')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar disponibilidade de soluções:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar solução:', error);
    return false;
  }
};

// Obter todas as soluções disponíveis
export const getAllSolutions = async () => {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar todas as soluções:', error);
    throw error;
  }
};

// Exportar funções de utilidade para operações comuns
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
