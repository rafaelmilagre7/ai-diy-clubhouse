
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface UseToolImageOptions {
  toolName?: string;
  toolId?: string;
}

export const useToolImage = ({ toolName, toolId }: UseToolImageOptions) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchToolImage = async () => {
      if (!toolName && !toolId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('tools').select('name, logo_url');

        if (toolId) {
          query = query.eq('id', toolId as any);
        } else if (toolName) {
          query = query.ilike('name', toolName as any);
        }

        const { data, error } = await query.limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0 && (data[0] as any).logo_url) {
          log('Logo da ferramenta encontrado', { 
            tool: (data[0] as any).name, 
            logoUrl: (data[0] as any).logo_url 
          });
          setLogoUrl((data[0] as any).logo_url);
        } else {
          log('Nenhum logo encontrado para a ferramenta', { 
            toolName, 
            toolId 
          });
          setLogoUrl(null);
        }
      } catch (err) {
        logError('Erro ao buscar logo da ferramenta', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar logo da ferramenta'));
      } finally {
        setLoading(false);
      }
    };

    fetchToolImage();
  }, [toolName, toolId, log, logError]);

  return { logoUrl, loading, error };
};
