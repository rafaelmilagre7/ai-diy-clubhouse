
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SimpleTool {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  official_url?: string;
  tags?: string[];
  benefit_title?: string;
  benefit_type?: string;
  benefit_description?: string;
  benefit_link?: string;
  benefit_discount_percentage?: number;
  has_member_benefit?: boolean;
  features?: string[];
  pricing_info?: string;
  has_valid_logo?: boolean;
}

export const useToolsData = () => {
  const [tools, setTools] = useState<SimpleTool[]>([]);
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
          .eq('is_active', true)
          .order('name');

        if (fetchError) {
          throw fetchError;
        }

        // Transform data to match Tool interface
        const transformedTools = (data || []).map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          logo_url: tool.logo_url,
          is_active: tool.is_active || true,
          created_at: tool.created_at,
          updated_at: tool.updated_at,
          official_url: tool.url || '',
          tags: [],
          benefit_title: tool.benefit_title,
          benefit_type: tool.benefit_type || 'discount',
          benefit_description: tool.benefit_description,
          benefit_link: tool.benefit_url,
          benefit_discount_percentage: null,
          has_member_benefit: Boolean(tool.benefit_title),
          features: tool.features || [],
          pricing_info: tool.pricing_info,
          has_valid_logo: !!tool.logo_url
        }));

        setTools(transformedTools);
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
