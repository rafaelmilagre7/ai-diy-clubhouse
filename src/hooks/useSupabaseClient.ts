
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import type { Database } from '@/lib/supabase/types/database.types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

interface UseSupabaseClientReturn {
  client: SupabaseClient | null;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

export const useSupabaseClient = (): UseSupabaseClientReturn => {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        logger.info('🔧 [HOOK] Inicializando cliente Supabase robusto...');
        
        // CORREÇÃO: Usar retry para garantir obtenção do cliente
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const supabaseClient = await getSupabaseClient();
            setClient(supabaseClient);
            
            logger.info('✅ [HOOK] Cliente Supabase pronto');
            return;
            
          } catch (attemptError) {
            retryCount++;
            if (retryCount >= maxRetries) {
              throw attemptError;
            }
            
            logger.warn(`⚠️ [HOOK] Tentativa ${retryCount} falhou, tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        logger.error('❌ [HOOK] Erro ao inicializar cliente Supabase:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  return {
    client,
    isLoading,
    error,
    isReady: !!client && !isLoading && !error
  };
};
