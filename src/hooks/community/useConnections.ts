
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
}

export const useConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar conexões do usuário
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async (): Promise<Connection[]> => {
      if (!user?.id) return [];

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Solicitar conexão
  const requestConnectionMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Solicitação de conexão enviada!');
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
    },
    onError: (error: any) => {
      console.error('Erro ao solicitar conexão:', error);
      toast.error('Erro ao enviar solicitação');
    }
  });

  // Aceitar conexão
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Conexão aceita!');
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
    },
    onError: (error: any) => {
      console.error('Erro ao aceitar conexão:', error);
      toast.error('Erro ao aceitar conexão');
    }
  });

  // Rejeitar conexão
  const rejectConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Conexão rejeitada');
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
    },
    onError: (error: any) => {
      console.error('Erro ao rejeitar conexão:', error);
      toast.error('Erro ao rejeitar conexão');
    }
  });

  return {
    connections,
    isLoading,
    requestConnection: requestConnectionMutation.mutate,
    acceptConnection: acceptConnectionMutation.mutate,
    rejectConnection: rejectConnectionMutation.mutate,
    isRequesting: requestConnectionMutation.isPending,
    isAccepting: acceptConnectionMutation.isPending,
    isRejecting: rejectConnectionMutation.isPending
  };
};
