
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { SimplifiedTool } from '@/lib/supabase/types';

export const useTools = (options?: { 
  checkAccessRestrictions?: boolean;
  categoryFilter?: string;
  benefitsOnly?: boolean;
}) => {
  const { user } = useSimpleAuth();
  const opts = {
    checkAccessRestrictions: true,
    ...options
  };

  const query = useQuery<SimplifiedTool[], Error>({
    queryKey: ['tools', user?.id, opts.categoryFilter, opts.benefitsOnly],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      let mappedData = (data || []).map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        url: tool.url,
        logo_url: tool.logo_url,
        pricing_info: tool.pricing_info,
        features: tool.features,
        is_active: tool.is_active,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
        has_member_benefit: tool.has_member_benefit || false,
        benefit_type: tool.benefit_type,
        benefit_discount_percentage: tool.benefit_discount_percentage || null,
        benefit_link: tool.benefit_link || null,
        benefit_title: tool.benefit_title,
        benefit_description: tool.benefit_description,
        status: tool.is_active // Map is_active to status for compatibility
      }));
      
      if (opts.categoryFilter) {
        mappedData = mappedData.filter(tool => tool.category === opts.categoryFilter);
      }

      if (opts.benefitsOnly) {
        mappedData = mappedData.filter(tool => tool.has_member_benefit);
      }

      return mappedData;
    },
    staleTime: 5 * 60 * 1000
  });

  return {
    tools: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
