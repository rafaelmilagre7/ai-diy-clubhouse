import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { NetworkingProfile } from '@/hooks/useNetworkingProfiles';
import { useState } from 'react';

const PAGE_SIZE = 20;

export const useDiscoverProfiles = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['discover-profiles', user?.id, page],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0, hasMore: false };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      try {
        // ✅ Tentar usar view otimizada primeiro
        const { data, error, count } = await supabase
          .from('available_profiles_for_connection')
          .select(`
            id,
            name,
            email,
            avatar_url,
            company_name,
            current_position,
            industry
          `, { count: 'exact' })
          .not('name', 'is', null)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          // Se a view não existir, usar query direta (fallback)
          if (error.message?.includes('does not exist')) {
            console.warn('View not found, using fallback query');
            
            const { data: fallbackData, error: fallbackError, count: fallbackCount } = await supabase
              .from('profiles')
              .select('id, name, email, avatar_url, company_name, current_position, industry', { count: 'exact' })
              .not('name', 'is', null)
              .neq('id', user.id)
              .order('created_at', { ascending: false })
              .range(from, to);

            if (fallbackError) throw fallbackError;

            const hasMore = (fallbackCount || 0) > (page + 1) * PAGE_SIZE;
            return { data: fallbackData as NetworkingProfile[], count: fallbackCount || 0, hasMore };
          }
          
          throw error;
        }

        const hasMore = (count || 0) > (page + 1) * PAGE_SIZE;
        return { data: data as NetworkingProfile[], count: count || 0, hasMore };
        
      } catch (error) {
        console.error('Error fetching discover profiles:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.data,
    hasMore: query.data?.hasMore || false,
    nextPage: () => setPage(p => p + 1),
    previousPage: () => setPage(p => Math.max(0, p - 1)),
    page,
    refetch: query.refetch,
    isFetching: query.isFetching, // ✅ Expor isFetching para loading states
  };
};
