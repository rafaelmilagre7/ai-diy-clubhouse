
import { useState, useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface UseToolLogoProps {
  toolId?: string;
  toolName?: string;
}

export const useToolLogo = ({ toolId, toolName }: UseToolLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { log, logError } = useLogging("useToolLogo");

  const { data: tool, isLoading: loading } = useQuery({
    queryKey: ['tool-logo', toolId || toolName],
    queryFn: async () => {
      try {
        let query = supabase.from('tools').select('logo_url, name');
        
        if (toolId) {
          query = query.eq('id', toolId);
        } else if (toolName) {
          query = query.ilike('name', toolName);
        } else {
          return null;
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          throw error;
        }
        
        return data;
      } catch (error) {
        logError("Erro ao buscar logo da ferramenta", { error, toolId, toolName });
        return null;
      }
    },
    enabled: !!toolId || !!toolName,
    staleTime: 10 * 60 * 1000 // 10 minutos
  });

  useEffect(() => {
    if (tool?.logo_url) {
      setLogoUrl(tool.logo_url);
    }
  }, [tool]);

  return { logoUrl, loading };
};
