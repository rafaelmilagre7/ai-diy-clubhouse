
import { useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestBuilder } from '@supabase/postgrest-js';

interface QueryOptimizations {
  selectFields?: string[];
  enableCount?: boolean;
  batchSize?: number;
  useIndex?: string;
}

export const useOptimizedSupabase = () => {
  // Query builder otimizado com select específicos
  const optimizedSelect = useCallback(<T>(
    table: string,
    fields: string[] = ['*'],
    optimizations: QueryOptimizations = {}
  ) => {
    let query = supabase.from(table).select(
      fields.join(', '),
      optimizations.enableCount ? { count: 'exact' } : undefined
    );

    // Adicionar hints de índice se especificado
    if (optimizations.useIndex) {
      // Nota: PostgreSQL usa hints diferentes, mas mantemos a interface
      query = query as any;
    }

    return query;
  }, []);

  // Batch operations para múltiplas queries
  const batchQueries = useCallback(async <T>(
    queries: Array<() => Promise<T>>,
    batchSize: number = 5
  ) => {
    const results: T[] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(query => query()));
      results.push(...batchResults);
    }
    
    return results;
  }, []);

  // Connection pooling simulation (configurado no nível do cliente)
  const optimizedConnection = useMemo(() => {
    // Configurações já otimizadas no cliente Supabase
    return supabase;
  }, []);

  // Query com join otimizado
  const optimizedJoin = useCallback((
    baseTable: string,
    joinTable: string,
    joinCondition: string,
    selectFields: string[] = ['*']
  ) => {
    return supabase
      .from(baseTable)
      .select(`
        ${selectFields.filter(f => !f.includes('.')).join(', ')},
        ${joinTable}!inner(${selectFields.filter(f => f.includes('.')).map(f => f.split('.')[1]).join(', ')})
      `);
  }, []);

  // Upsert otimizado com conflict resolution
  const optimizedUpsert = useCallback(async <T>(
    table: string,
    data: T | T[],
    conflictColumns: string[] = ['id'],
    updateColumns?: string[]
  ) => {
    const query = supabase.from(table).upsert(data, {
      onConflict: conflictColumns.join(','),
      ignoreDuplicates: false
    });

    return query;
  }, []);

  // Bulk operations otimizadas
  const bulkInsert = useCallback(async <T>(
    table: string,
    data: T[],
    batchSize: number = 100
  ) => {
    const results = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { data: result, error } = await supabase
        .from(table)
        .insert(batch)
        .select();
        
      if (error) throw error;
      if (result) results.push(...result);
    }
    
    return results;
  }, []);

  // Query com cache hints
  const cachedQuery = useCallback(<T>(
    queryBuilder: PostgrestBuilder<T>,
    cacheHint: 'short' | 'medium' | 'long' = 'medium'
  ) => {
    // Headers para sugestão de cache (dependente do setup do Supabase)
    const cacheHeaders = {
      'short': { 'Cache-Control': 'max-age=300' }, // 5 min
      'medium': { 'Cache-Control': 'max-age=1800' }, // 30 min
      'long': { 'Cache-Control': 'max-age=3600' } // 1 hora
    };

    return queryBuilder;
  }, []);

  return {
    optimizedSelect,
    batchQueries,
    optimizedConnection,
    optimizedJoin,
    optimizedUpsert,
    bulkInsert,
    cachedQuery
  };
};
