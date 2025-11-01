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
      // Buscar informações da conexão antes de aceitar
      const { data: connection, error: fetchError } = await supabase
        .from('member_connections')
        .select('requester_id, recipient_id, requester:profiles!member_connections_requester_id_fkey(id, name)')
        .eq('id', connectionId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;

      // Marcar notificação de solicitação como lida
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('type', 'connection_request')
        .eq('reference_id', connectionId)
        .eq('reference_type', 'connection');

      // Criar notificação de conexão aceita para o solicitante
      await supabase
        .from('notifications')
        .insert({
          user_id: connection.requester_id,
          actor_id: user?.id,
          type: 'connection_accepted',
          category: 'social',
          title: 'Conexão aceita! 🎉',
          message: 'Aceitou sua solicitação de conexão',
          action_url: `/perfil/${connection.recipient_id}`,
          priority: 'high',
          reference_id: connectionId,
          reference_type: 'connection'
        });

      // Criar conversa automaticamente entre os dois usuários
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: connection.requester_id,
          participant_2_id: connection.recipient_id,
          last_message_at: new Date().toISOString()
        });

      if (conversationError) {
        console.error('Erro ao criar conversa:', conversationError);
        // Não lançar erro para não bloquear a aceitação da conexão
      }

      return connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

      // Marcar notificação como lida
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('type', 'connection_request')
        .eq('reference_id', connectionId)
        .eq('reference_type', 'connection');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['networking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Solicitação recusada');
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao recusar solicitação');
    },
  });

  // Cancelar solicitação enviada
  const cancelRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['networking-stats'] });
      toast.success('Solicitação cancelada');
    },
    onError: (error) => {
      console.error('Error canceling request:', error);
      toast.error('Erro ao cancelar solicitação');
    },
  });

  // Remover conexão
  const removeConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['active-connections'] });
      queryClient.invalidateQueries({ queryKey: ['networking-stats'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      toast.success('Conexão removida com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover conexão:', error);
      toast.error('Erro ao remover a conexão');
    }
  });

  // Mutation para enviar solicitação de conexão
  const sendConnectionRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      const { data: connection, error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user?.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Criar notificação unificada para o destinatário
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          actor_id: user?.id,
          type: 'connection_request',
          category: 'social',
          title: 'Nova solicitação de conexão',
          message: 'Quer se conectar com você',
          action_url: `/networking/connections?tab=pending&sub=received`,
          priority: 'normal',
          reference_id: connection.id,
          reference_type: 'connection'
        });

      if (notifError) console.error('Erro ao criar notificação:', notifError);

      return connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connection-status'] });
      toast.success('Solicitação de conexão enviada!');
    },
    onError: (error) => {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação de conexão');
    }
  });

  // Query para verificar status de conexão com um usuário específico
  const useCheckConnectionStatus = (otherUserId: string | undefined) => {
    return useQuery({
      queryKey: ['connection-status', user?.id, otherUserId],
      queryFn: async () => {
        if (!user?.id || !otherUserId) return null;

        const { data, error } = await supabase
          .from('member_connections')
          .select('id, status, requester_id, recipient_id')
          .or(`and(requester_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      enabled: !!user?.id && !!otherUserId,
      staleTime: 30000 // Cache por 30 segundos
    });
  };

  return {
    activeConnections: activeConnections || [],
    isLoading,
    error,
    acceptRequest: acceptRequest.mutate,
    rejectRequest: rejectRequest.mutate,
    isAccepting: acceptRequest.isPending,
    isRejecting: rejectRequest.isPending,
    cancelRequest: cancelRequest.mutate,
    isCancelingRequest: cancelRequest.isPending,
    sendConnectionRequest: sendConnectionRequest.mutate,
    sendConnectionRequestAsync: sendConnectionRequest.mutateAsync,
    isSendingRequest: sendConnectionRequest.isPending,
    removeConnection: removeConnection.mutate,
    removeConnectionAsync: removeConnection.mutateAsync,
    isRemovingConnection: removeConnection.isPending,
    useCheckConnectionStatus,
  };
};
