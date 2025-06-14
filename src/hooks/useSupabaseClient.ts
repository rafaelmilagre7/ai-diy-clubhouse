
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
        
        logger.info('🔧 [HOOK] Inicializando cliente Supabase...');
        
        const supabaseClient = await getSupabaseClient();
        setClient(supabaseClient);
        
        logger.info('✅ [HOOK] Cliente Supabase pronto');
        
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
