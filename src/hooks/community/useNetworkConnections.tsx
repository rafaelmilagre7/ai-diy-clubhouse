
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [connectedMembers, setConnectedMembers] = useState<Set<string>>(new Set());
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchConnections = async () => {
      try {
        setIsLoading(true);

        // Buscar conexões aceitas onde o usuário é o solicitante
        const { data: sentAccepted, error: sentError } = await supabase
          .from('member_connections')
          .select('recipient_id')
          .eq('requester_id', user.id)
          .eq('status', 'accepted');

        if (sentError) throw sentError;

        // Buscar conexões aceitas onde o usuário é o destinatário
        const { data: receivedAccepted, error: receivedError } = await supabase
          .from('member_connections')
          .select('requester_id')
          .eq('recipient_id', user.id)
          .eq('status', 'accepted');

        if (receivedError) throw receivedError;

        // Buscar conexões pendentes enviadas pelo usuário
        const { data: pendingSent, error: pendingSentError } = await supabase
          .from('member_connections')
          .select('recipient_id')
          .eq('requester_id', user.id)
          .eq('status', 'pending');

        if (pendingSentError) throw pendingSentError;

        // Processar e armazenar as conexões aceitas
        const connected = new Set<string>();
        sentAccepted?.forEach((connection) => connected.add(connection.recipient_id));
        receivedAccepted?.forEach((connection) => connected.add(connection.requester_id));
        setConnectedMembers(connected);

        // Processar e armazenar as conexões pendentes
        const pending = new Set<string>();
        pendingSent?.forEach((connection) => pending.add(connection.recipient_id));
        setPendingConnections(pending);

      } catch (error) {
        console.error('Erro ao buscar conexões:', error);
        toast.error('Não foi possível carregar suas conexões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user?.id]);

  // Enviar uma solicitação de conexão para outro membro
  const sendConnectionRequest = async (recipientId: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para enviar solicitações de conexão');
      return;
    }

    try {
      // Verificar se já existe uma conexão
      const { data: existingConnection, error: checkError } = await supabase
        .from('member_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${recipientId},recipient_id.eq.${recipientId}`);

      if (checkError) throw checkError;

      // Se já existe uma conexão, mostrar mensagem apropriada
      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        
        if (connection.status === 'accepted') {
          toast.info('Vocês já estão conectados');
        } else if (connection.status === 'pending') {
          if (connection.requester_id === user.id) {
            toast.info('Você já enviou uma solicitação para este usuário');
          } else {
            toast.info('Este usuário já te enviou uma solicitação');
          }
        } else if (connection.status === 'rejected') {
          // Pode ser uma boa ideia permitir reenviar após algum tempo
          toast.info('Não é possível enviar uma solicitação para este usuário no momento');
        }
        
        return;
      }

      // Enviar nova solicitação de conexão
      const { data, error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select();

      if (error) throw error;

      // Adicionar à lista de pendentes
      setPendingConnections(prev => new Set([...prev, recipientId]));
      
      toast.success('Solicitação de conexão enviada com sucesso');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Não foi possível enviar a solicitação de conexão');
    }
  };

  // Aceitar uma solicitação de conexão
  const acceptConnectionRequest = async (requesterId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setConnectedMembers(prev => new Set([...prev, requesterId]));
      
      refreshConnections();
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast.error('Não foi possível aceitar a solicitação');
      return false;
    }
  };

  // Rejeitar uma solicitação de conexão
  const rejectConnectionRequest = async (requesterId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);

      if (error) throw error;
      
      refreshConnections();
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Não foi possível rejeitar a solicitação');
      return false;
    }
  };

  // Remover uma conexão existente
  const removeConnection = async (memberId: string) => {
    if (!user?.id) return;

    try {
      // Remover independente de quem é o requester ou recipient
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${user.id})`);

      if (error) throw error;

      // Atualizar estado local
      setConnectedMembers(prev => {
        const updated = new Set([...prev]);
        updated.delete(memberId);
        return updated;
      });

      toast.success('Conexão removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover conexão:', error);
      toast.error('Não foi possível remover a conexão');
    }
  };

  // Cancelar uma solicitação de conexão pendente
  const cancelConnectionRequest = async (recipientId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('requester_id', user.id)
        .eq('recipient_id', recipientId)
        .eq('status', 'pending');

      if (error) throw error;

      // Atualizar estado local
      setPendingConnections(prev => {
        const updated = new Set([...prev]);
        updated.delete(recipientId);
        return updated;
      });

      toast.success('Solicitação cancelada com sucesso');
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      toast.error('Não foi possível cancelar a solicitação');
    }
  };

  // Atualizar as conexões
  const refreshConnections = async () => {
    if (!user?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Buscar conexões aceitas onde o usuário é o solicitante
      const { data: sentAccepted } = await supabase
        .from('member_connections')
        .select('recipient_id')
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      // Buscar conexões aceitas onde o usuário é o destinatário
      const { data: receivedAccepted } = await supabase
        .from('member_connections')
        .select('requester_id')
        .eq('recipient_id', user.id)
        .eq('status', 'accepted');

      // Buscar conexões pendentes enviadas pelo usuário
      const { data: pendingSent } = await supabase
        .from('member_connections')
        .select('recipient_id')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      // Processar e armazenar as conexões aceitas
      const connected = new Set<string>();
      sentAccepted?.forEach((connection) => connected.add(connection.recipient_id));
      receivedAccepted?.forEach((connection) => connected.add(connection.requester_id));
      setConnectedMembers(connected);

      // Processar e armazenar as conexões pendentes
      const pending = new Set<string>();
      pendingSent?.forEach((connection) => pending.add(connection.recipient_id));
      setPendingConnections(pending);
    } catch (error) {
      console.error('Erro ao atualizar conexões:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    connectedMembers,
    pendingConnections,
    isLoading,
    isRefreshing,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    cancelConnectionRequest,
    refreshConnections
  };
};
