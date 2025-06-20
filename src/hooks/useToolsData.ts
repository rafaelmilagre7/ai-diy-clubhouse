
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';

export const useToolsData = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true as any)
          .order('name');

        if (fetchError) {
          throw fetchError;
        }

        setTools((data as any) || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar ferramentas');
        console.error('Erro ao buscar ferramentas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  return { tools, isLoading, error };
};
