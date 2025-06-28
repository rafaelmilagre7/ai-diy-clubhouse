
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

// Simplified tool type
interface SimplifiedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  url?: string;
  logo_url?: string;
  is_active: boolean;
  has_member_benefit?: boolean;
}

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

      let filteredData = data || [];
      
      if (opts.categoryFilter) {
        filteredData = filteredData.filter(tool => tool.category === opts.categoryFilter);
      }

      if (opts.benefitsOnly) {
        filteredData = filteredData.filter(tool => tool.has_member_benefit);
      }

      return filteredData as SimplifiedTool[];
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
