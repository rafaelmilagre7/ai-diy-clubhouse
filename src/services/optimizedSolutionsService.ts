
import { supabase } from '@/lib/supabase';
import { Solution } from '@/lib/supabase';

// Cache in-memory para sessão atual
const sessionCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const fetchOptimizedSolutions = async (): Promise<Solution[]> => {
  const cacheKey = 'solutions_optimized';
  const cached = sessionCache.get(cacheKey);
  
  // Verificar cache in-memory primeiro
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Query otimizada com select específicos
    const { data, error } = await supabase
      .from("solutions")
      .select(`
        id,
        title,
        description,
        difficulty,
        category,
        thumbnail_url,
        published,
        created_at,
        updated_at,
        slug,
        estimated_time_minutes
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50); // Limitar resultados iniciais

    if (error) throw error;

    const solutions = data || [];
    
    // Armazenar no cache in-memory
    sessionCache.set(cacheKey, {
      data: solutions,
      timestamp: Date.now()
    });

    return solutions as Solution[];
  } catch (error) {
    console.error('[OPTIMIZED_SOLUTIONS] Erro ao buscar soluções:', error);
    
    // Retornar cache mesmo expirado em caso de erro
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      console.info('[OPTIMIZED_SOLUTIONS] Usando cache expirado devido a erro');
      return cached.data;
    }
    
    throw error;
  }
};

// Preload de soluções relacionadas
export const preloadRelatedSolutions = async (category: string): Promise<void> => {
  const cacheKey = `solutions_category_${category}`;
  
  if (sessionCache.has(cacheKey)) return;

  try {
    const { data } = await supabase
      .from("solutions")
      .select(`
        id,
        title,
        category,
        difficulty,
        thumbnail_url
      `)
      .eq("published", true)
      .eq("category", category)
      .limit(10);

    if (data) {
      sessionCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.warn('[PRELOAD] Erro ao preload de soluções relacionadas:', error);
  }
};

// Batch fetch para múltiplas soluções
export const batchFetchSolutions = async (ids: string[]): Promise<Solution[]> => {
  if (ids.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("solutions")
      .select(`
        id,
        title,
        description,
        difficulty,
        category,
        thumbnail_url,
        published,
        created_at
      `)
      .in("id", ids)
      .eq("published", true);

    if (error) throw error;
    return data as Solution[];
  } catch (error) {
    console.error('[BATCH_FETCH] Erro ao buscar soluções em lote:', error);
    return [];
  }
};
