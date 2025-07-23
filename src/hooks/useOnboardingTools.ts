import { useState, useEffect } from 'react';
import { Tool } from '@/types/toolTypes';
import { supabase } from '@/lib/supabase';

// Hook isolado apenas para o onboarding - evita conflitos com outras partes do sistema
export const useOnboardingTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingTools = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true)
          .order('name');

        if (error) {
          console.error('Erro ao buscar ferramentas para onboarding:', error);
          return;
        }

        // Processar ferramentas para o onboarding
        const processedTools = (data || []).map(tool => ({
          ...tool,
          has_valid_logo: Boolean(tool.logo_url),
        }));

        setTools(processedTools);
      } catch (error) {
        console.error('Erro ao buscar ferramentas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingTools();
  }, []); // Executar apenas uma vez

  return { tools, isLoading };
};