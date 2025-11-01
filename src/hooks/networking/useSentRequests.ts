import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Connection } from './useConnections';

export const useSentRequests = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['sent-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          *,
          requester:profiles!member_connections_requester_id_fkey(
            id,
            name,
            email,
            avatar_url,
            company_name,
            current_position,
            industry
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id,
            name,
            email,
            avatar_url,
            company_name,
            current_position,
            industry
          )
        `)
        .eq('status', 'pending')
        .eq('requester_id', user.id) // Apenas solicitações enviadas
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as Connection[];
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  return {
    sentRequests: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
