
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface UseToolLogoProps {
  toolName?: string;
  toolId?: string;
}

export const useToolLogo = ({ toolName, toolId }: UseToolLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchToolLogo = async () => {
      if (!toolName && !toolId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let query = supabase.from('tools').select('logo_url, name, has_member_benefit, benefit_type');
        
        if (toolId) {
          query = query.eq('id', toolId as any);
        } else if (toolName) {
          query = query.ilike('name', toolName as any);
        }
        
        const { data, error } = await query.limit(1);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          log('Logo da ferramenta encontrado', { tool: (data[0] as any).name });
          setLogoUrl((data[0] as any).logo_url);
        } else {
          log('Nenhum logo encontrado para a ferramenta', { toolName, toolId });
        }
      } catch (error) {
        logError('Erro ao buscar logo da ferramenta', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchToolLogo();
  }, [toolName, toolId, log, logError]);
  
  return { logoUrl, loading };
};
