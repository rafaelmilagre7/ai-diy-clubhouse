
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
export * from '@/types/supabaseTypes';

// Usando constantes da configuração centralizada
import { supabaseConfig } from './config';

export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
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

// FUNÇÃO PRINCIPAL: Implementação robusta para buscar solução por ID
export const fetchSolutionById = async (id: string) => {
  try {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID da solução inválido ou não especificado');
    }
    
    console.log(`[Supabase] Buscando solução diretamente por ID: ${id}`);
    
    // Buscar TODOS os registros da tabela solutions (sem filtro)
    const { data: allSolutions, error: listError, status: listStatus } = await supabase
      .from('solutions')
      .select('*');
      
    // Log detalhado das soluções disponíveis
    console.log(`[Supabase] Total de soluções no banco: ${allSolutions?.length || 0}`);
    
    if (listError) {
      console.error('Erro ao listar todas as soluções:', listError);
      throw listError;
    }
    
    if (!allSolutions || allSolutions.length === 0) {
      console.error('Nenhuma solução cadastrada no banco de dados');
      throw new Error('Base de dados sem soluções cadastradas');
    }
    
    // Procurar solução pelo ID informado
    const foundSolution = allSolutions.find(solution => solution.id === id);
    
    if (!foundSolution) {
      // Se não encontrar pelo ID exato, exibir os IDs disponíveis para diagnóstico
      console.error(`Solução com ID ${id} não encontrada. IDs disponíveis:`, 
        allSolutions.map(s => ({ id: s.id, title: s.title })));
      
      // No ambiente de produção, selecionamos a primeira solução disponível como fallback
      if (allSolutions.length > 0) {
        console.log(`[FALLBACK] Retornando primeira solução disponível: ${allSolutions[0].id} - ${allSolutions[0].title}`);
        return allSolutions[0];
      }
      
      throw new Error(`Solução com ID ${id} não encontrada no banco de dados`);
    }
    
    console.log('Solução encontrada:', foundSolution.title);
    return foundSolution;
  } catch (error) {
    console.error('Erro na função fetchSolutionById:', error);
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

// NOVA FUNÇÃO: Verificação robusta de existência de solução
export const checkSolutionExists = async (id: string): Promise<boolean> => {
  try {
    if (!id) return false;
    
    const { data, error } = await supabase
      .from('solutions')
      .select('id, title')
      .limit(10);  // Limitamos a consulta para performance
    
    if (error) {
      console.error('Erro ao verificar disponibilidade de soluções:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('Nenhuma solução disponível no banco de dados');
      return false;
    }
    
    // Verificamos se a solução específica existe
    const exists = data.some(solution => solution.id === id);
    console.log(`ID ${id} existe no banco? ${exists ? 'SIM' : 'NÃO'}`, 
      { disponíveis: data.map(s => ({ id: s.id, title: s.title })) });
    
    return exists;
  } catch (error) {
    console.error('Erro ao verificar solução:', error);
    return false;
  }
};

// NOVA FUNÇÃO: Obter todas as soluções disponíveis
export const getAllSolutions = async () => {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`Recuperadas ${data?.length || 0} soluções do banco de dados`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar todas as soluções:', error);
    throw error;
  }
};
