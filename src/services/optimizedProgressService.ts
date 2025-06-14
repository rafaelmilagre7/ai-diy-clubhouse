
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface ProgressData {
  id: string;
  user_id: string;
  solution_id: string;
  is_completed: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

// Cache otimizado para progresso do usuário
const progressCache = new Map<string, { data: ProgressData[], timestamp: number }>();
const PROGRESS_CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const fetchUserProgress = async (userId?: string): Promise<ProgressData[]> => {
  if (!userId) return [];
  
  const cacheKey = `progress_${userId}`;
  const cached = progressCache.get(cacheKey);
  
  // Verificar cache primeiro
  if (cached && Date.now() - cached.timestamp < PROGRESS_CACHE_TTL) {
    return cached.data;
  }

  try {
    // Query otimizada com select específicos
    const { data, error } = await supabase
      .from("progress")
      .select(`
        id,
        user_id,
        solution_id,
        is_completed,
        progress_percentage,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const progressData = data || [];
    
    // Armazenar no cache
    progressCache.set(cacheKey, {
      data: progressData,
      timestamp: Date.now()
    });

    return progressData;
  } catch (error) {
    console.error('[OPTIMIZED_PROGRESS] Erro ao buscar progresso:', error);
    
    // Retornar cache expirado em caso de erro
    const cached = progressCache.get(cacheKey);
    if (cached) {
      return cached.data;
    }
    
    return [];
  }
};

// Batch update para progresso
export const batchUpdateProgress = async (
  updates: Array<{
    id: string;
    progress_percentage?: number;
    is_completed?: boolean;
  }>
): Promise<void> => {
  if (updates.length === 0) return;

  try {
    // Processar em lotes de 10
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    // Executar lotes sequencialmente para evitar conflitos
    for (const batch of batches) {
      const promises = batch.map(update =>
        supabase
          .from("progress")
          .update({
            progress_percentage: update.progress_percentage,
            is_completed: update.is_completed,
            updated_at: new Date().toISOString()
          })
          .eq("id", update.id)
      );

      await Promise.all(promises);
    }

    // Invalidar cache após updates
    progressCache.clear();
  } catch (error) {
    console.error('[BATCH_UPDATE_PROGRESS] Erro ao atualizar progresso:', error);
    throw error;
  }
};

// Preload de progresso para soluções específicas
export const preloadSolutionProgress = async (
  solutionIds: string[],
  userId: string
): Promise<void> => {
  if (solutionIds.length === 0 || !userId) return;

  try {
    const { data } = await supabase
      .from("progress")
      .select("solution_id, is_completed, progress_percentage")
      .eq("user_id", userId)
      .in("solution_id", solutionIds);

    if (data) {
      // Armazenar no cache parcial para consultas rápidas
      const partialCacheKey = `progress_partial_${userId}`;
      const existing = progressCache.get(partialCacheKey)?.data || [];
      
      progressCache.set(partialCacheKey, {
        data: [...existing, ...data],
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.warn('[PRELOAD_PROGRESS] Erro ao preload de progresso:', error);
  }
};
