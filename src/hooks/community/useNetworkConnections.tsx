
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { MemberConnection } from '@/types/forumTypes';
import { toast } from 'sonner';

export const useNetworkConnections = () => {
  const [connectedMembers, setConnectedMembers] = useState<Set<string>>(new Set());
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Carregar as conexões existentes
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Buscar conexões onde o usuário é o solicitante
        const { data: sentConnections, error: sentError } = await supabase
          .from('member_connections')
          .select('*')
          .eq('requester_id', user.id);

        // Buscar conexões onde o usuário é o destinatário
        const { data: receivedConnections, error: receivedError } = await supabase
          .from('member_connections')
          .select('*')
          .eq('recipient_id', user.id);

        if (sentError || receivedError) throw sentError || receivedError;

        // Processar as conexões
        const connected = new Set<string>();
        const pending = new Set<string>();

        sentConnections?.forEach((conn: MemberConnection) => {
          if (conn.status === 'accepted') {
            connected.add(conn.recipient_id);
          } else if (conn.status === 'pending') {
            pending.add(conn.recipient_id);
          }
        });

        receivedConnections?.forEach((conn: MemberConnection) => {
          if (conn.status === 'accepted') {
            connected.add(conn.requester_id);
          }
        });

        setConnectedMembers(connected);
        setPendingConnections(pending);
      } catch (error) {
        console.error('Erro ao carregar conexões:', error);
        toast.error('Não foi possível carregar suas conexões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user?.id]);

  // Função para enviar uma solicitação de conexão
  const sendConnectionRequest = async (recipientId: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para enviar solicitações de conexão');
      return false;
    }

    if (connectedMembers.has(recipientId) || pendingConnections.has(recipientId)) {
      return false; // Já conectado ou pendente
    }

    try {
      const { data, error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setPendingConnections(prev => new Set(prev).add(recipientId));
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar solicitação de conexão:', error);
      toast.error('Não foi possível enviar a solicitação de conexão');
      return false;
    }
  };

  // Função para aceitar uma solicitação de conexão
  const acceptConnectionRequest = async (requesterId: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setConnectedMembers(prev => new Set(prev).add(requesterId));
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast.error('Não foi possível aceitar a solicitação de conexão');
      return false;
    }
  };

  // Função para rejeitar uma solicitação de conexão
  const rejectConnectionRequest = async (requesterId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Não foi possível rejeitar a solicitação de conexão');
      return false;
    }
  };

  // Verificar status de conexão com um membro específico
  const checkConnectionStatus = (memberId: string) => {
    if (connectedMembers.has(memberId)) {
      return 'connected';
    }
    if (pendingConnections.has(memberId)) {
      return 'pending';
    }
    return 'none';
  };

  return {
    connectedMembers,
    pendingConnections,
    isLoading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    checkConnectionStatus
  };
};
