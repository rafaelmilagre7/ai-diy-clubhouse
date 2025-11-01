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

      // ✅ MELHORIA #1: Usar view otimizada do banco
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

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

      if (error) throw error;

      const hasMore = (count || 0) > (page + 1) * PAGE_SIZE;

      return { data: data as NetworkingProfile[], count: count || 0, hasMore };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    ...query,
    data: query.data?.data,
    hasMore: query.data?.hasMore || false,
    nextPage: () => setPage(p => p + 1),
    previousPage: () => setPage(p => Math.max(0, p - 1)),
    page,
    refetch: query.refetch,
  };
};
