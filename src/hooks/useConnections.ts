import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useNetworkingAnalytics } from '@/hooks/useNetworkingAnalytics';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
}

export const useConnections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logEvent } = useNetworkingAnalytics();

  // Buscar conexões do usuário atual
  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('member_connections')
        .select(`
          *,
          requester:profiles!member_connections_requester_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          ),
          recipient:profiles!member_connections_recipient_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          )
        `)
        .or(`requester_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Connection[];
    },
  });

  // Verificar se já existe conexão entre dois usuários
  const checkConnection = async (otherUserId: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('member_connections')
      .select('*')
      .or(
        `and(requester_id.eq.${user.user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.user.id})`
      )
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  // Enviar solicitação de conexão
  const sendConnectionRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Verificar se já existe uma conexão
      const existingConnection = await checkConnection(recipientId);
      if (existingConnection) {
        throw new Error('Conexão já existe');
      }

      // Criar solicitação de conexão
      const { data, error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Criar notificação
      await supabase
        .from('connection_notifications')
        .insert({
          user_id: recipientId,
          sender_id: user.user.id,
          type: 'request'
        });

      return data;
    },
    onSuccess: (data, recipientId) => {
      // Log evento de conexão enviada
      logEvent.mutate({
        event_type: 'connection_sent',
        partner_id: recipientId,
        event_data: { connection_id: data.id }
      });

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de conexão foi enviada com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar solicitação de conexão",
        variant: "destructive"
      });
    }
  });

  // Aceitar solicitação de conexão
  const acceptConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;

      // Criar notificação para quem enviou
      await supabase
        .from('connection_notifications')
        .insert({
          user_id: data.requester_id,
          sender_id: data.recipient_id,
          type: 'accepted'
        });

      return data;
    },
    onSuccess: (data) => {
      // Log evento de conexão aceita
      logEvent.mutate({
        event_type: 'connection_accepted',
        partner_id: data.requester_id,
        event_data: { connection_id: data.id }
      });

      toast({
        title: "Conexão aceita",
        description: "Vocês agora estão conectados!"
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao aceitar conexão",
        variant: "destructive"
      });
    }
  });

  // Rejeitar solicitação de conexão
  const rejectConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação de conexão foi rejeitada."
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
    }
  });

  // Cancelar solicitação enviada
  const cancelConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Solicitação cancelada",
        description: "Sua solicitação foi cancelada."
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });

  return {
    connections: connections || [],
    isLoading,
    checkConnection,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    cancelConnection
  };
};