import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
  };
}

export const useConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar conexões ativas
  const { data: activeConnections, isLoading, error } = useQuery({
    queryKey: ['active-connections', user?.id],
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
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as Connection[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Aceitar solicitação
  const acceptRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast.success('Conexão aceita com sucesso!');
    },
    onError: (error) => {
      console.error('Error accepting request:', error);
      toast.error('Erro ao aceitar conexão');
    },
  });

  // Rejeitar solicitação
  const rejectRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast.success('Solicitação recusada');
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao recusar solicitação');
    },
  });

  return {
    activeConnections: activeConnections || [],
    isLoading,
    error,
    acceptRequest: acceptRequest.mutate,
    rejectRequest: rejectRequest.mutate,
    isAccepting: acceptRequest.isPending,
    isRejecting: rejectRequest.isPending,
  };
};
