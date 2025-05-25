
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
}

export const useConnectionsManagement = () => {
  const queryClient = useQueryClient();

  // Buscar conexões do usuário
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['user-connections'],
    queryFn: async (): Promise<ConnectionRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          *,
          requester:profiles!member_connections_requester_id_fkey(
            id, name, avatar_url, company_name, current_position
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id, name, avatar_url, company_name, current_position
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar solicitações pendentes recebidas
  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['pending-connection-requests'],
    queryFn: async (): Promise<ConnectionRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          *,
          requester:profiles!member_connections_requester_id_fkey(
            id, name, avatar_url, company_name, current_position
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id, name, avatar_url, company_name, current_position
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar solicitações enviadas
  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sent-connection-requests'],
    queryFn: async (): Promise<ConnectionRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          *,
          requester:profiles!member_connections_requester_id_fkey(
            id, name, avatar_url, company_name, current_position
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id, name, avatar_url, company_name, current_position
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Aceitar solicitação
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Conexão aceita com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
    },
    onError: (error) => {
      console.error('Erro ao aceitar conexão:', error);
      toast.error('Erro ao aceitar conexão');
    }
  });

  // Rejeitar solicitação
  const rejectConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Solicitação rejeitada');
      queryClient.invalidateQueries({ queryKey: ['pending-connection-requests'] });
    },
    onError: (error) => {
      console.error('Erro ao rejeitar conexão:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  });

  // Remover conexão
  const removeConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Conexão removida');
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
    },
    onError: (error) => {
      console.error('Erro ao remover conexão:', error);
      toast.error('Erro ao remover conexão');
    }
  });

  return {
    connections,
    pendingRequests,
    sentRequests,
    isLoading: connectionsLoading || requestsLoading || sentLoading,
    acceptConnection: acceptConnectionMutation.mutate,
    rejectConnection: rejectConnectionMutation.mutate,
    removeConnection: removeConnectionMutation.mutate,
    isProcessing: acceptConnectionMutation.isPending || 
                  rejectConnectionMutation.isPending || 
                  removeConnectionMutation.isPending
  };
};
