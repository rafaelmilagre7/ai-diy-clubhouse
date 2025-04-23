
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
      
      // Adicionar log para depurar requisições problemáticas
      console.log(`[Supabase] Requisição iniciada: ${url}`);
      
      return fetch(url, { ...options, signal })
        .then(response => {
          console.log(`[Supabase] Resposta recebida: ${url} | Status: ${response.status}`);
          return response;
        })
        .catch(error => {
          console.error(`[Supabase] Erro na requisição: ${url}`, error);
          throw error;
        })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Exportar funções de utilidade para operações comuns
export const fetchSolutionById = async (id: string) => {
  try {
    console.log(`Buscando solução com ID: ${id}`);
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID da solução inválido ou não especificado');
    }
    
    // Refatoração da consulta para maior clareza e detalhamento de logs
    const { data, error, status, statusText } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', id)
      .single();  

    console.log(`[Supabase] Resultado da consulta:`, { data, error, status, statusText });

    if (error) {
      if (error.code === 'PGRST116') {
        console.error(`Solução com ID ${id} não encontrada no banco de dados`);
        throw new Error(`Solução não encontrada (ID: ${id})`);
      }
      console.error('Erro na consulta Supabase:', error);
      throw error;
    }

    if (!data) {
      console.error(`Solução com ID ${id} retornou dados vazios`);
      throw new Error('Nenhum dado encontrado para esta solução');
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

// Função auxiliar para verificar se uma solução existe
export const checkSolutionExists = async (id: string): Promise<boolean> => {
  try {
    if (!id) return false;
    
    const { count, error } = await supabase
      .from('solutions')
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao verificar existência da solução:', error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Erro ao verificar solução:', error);
    return false;
  }
};
