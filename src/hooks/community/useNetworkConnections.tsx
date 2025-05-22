
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ConnectionMember } from '@/types/forumTypes';

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [connectedMembers, setConnectedMembers] = useState<ConnectionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ConnectionMember[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        
        // Buscar todas as conexões aceitas (enviadas ou recebidas)
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('member_connections')
          .select(`
            id,
            requester_id,
            recipient_id,
            profiles:requester_id (
              id, 
              name,
              avatar_url,
              company_name,
              current_position,
              industry
            ),
            recipients:recipient_id (
              id,
              name,
              avatar_url,
              company_name,
              current_position,
              industry
            )
          `)
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (connectionsError) throw connectionsError;

        // Processar dados para o formato ConnectionMember
        const connections: ConnectionMember[] = connectionsData?.map(conn => {
          if (conn.requester_id === user.id) {
            // O usuário é o solicitante, então a conexão é com o destinatário
            return {
              id: conn.recipient_id,
              name: conn.recipients?.name || null,
              avatar_url: conn.recipients?.avatar_url || null,
              company_name: conn.recipients?.company_name || null,
              current_position: conn.recipients?.current_position || null,
              industry: conn.recipients?.industry || null
            };
          } else {
            // O usuário é o destinatário, então a conexão é com o solicitante
            return {
              id: conn.requester_id,
              name: conn.profiles?.name || null,
              avatar_url: conn.profiles?.avatar_url || null,
              company_name: conn.profiles?.company_name || null,
              current_position: conn.profiles?.current_position || null,
              industry: conn.profiles?.industry || null
            };
          }
        }) || [];

        setConnectedMembers(connections);
        
        // Buscar solicitações pendentes enviadas pelo usuário
        const { data: pendingData, error: pendingError } = await supabase
          .from('member_connections')
          .select(`
            id,
            recipient_id,
            recipients:recipient_id (
              id,
              name,
              avatar_url,
              company_name,
              current_position,
              industry
            )
          `)
          .eq('requester_id', user.id)
          .eq('status', 'pending');
          
        if (pendingError) throw pendingError;
        
        // Processar solicitações pendentes
        const pending: ConnectionMember[] = pendingData?.map(item => ({
          id: item.recipient_id,
          name: item.recipients?.name || null,
          avatar_url: item.recipients?.avatar_url || null,
          company_name: item.recipients?.company_name || null,
          current_position: item.recipients?.current_position || null,
          industry: item.recipients?.industry || null
        })) || [];
        
        setPendingRequests(pending);
      } catch (error) {
        console.error('Erro ao buscar conexões:', error);
        toast.error('Não foi possível carregar suas conexões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
    
    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('network_connections_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'member_connections',
          filter: `requester_id=eq.${user.id}`
        },
        () => {
          // Quando houver mudança na tabela como solicitante
          fetchConnections();
        }
      )
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'member_connections',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          // Quando houver mudança na tabela como destinatário
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Enviar uma solicitação de conexão
  const sendConnectionRequest = async (memberId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Verificar se já existe uma conexão com este membro
    const isConnected = connectedMembers.some(member => member.id === memberId);
    if (isConnected) {
      toast.info('Você já está conectado com este membro');
      return false;
    }
    
    // Verificar se já existe uma solicitação pendente
    const isPending = pendingRequests.some(request => request.id === memberId);
    if (isPending) {
      toast.info('Você já enviou uma solicitação para este membro');
      return false;
    }

    setProcessingRequest(true);

    try {
      // Verificar se já existe uma conexão ou solicitação
      const { count, error: countError } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${user.id})`);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.info('Já existe uma conexão ou solicitação com este membro');
        return false;
      }
      
      // Criar solicitação
      const { error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: memberId,
          status: 'pending'
        });

      if (error) throw error;
      
      // Atualizar lista de solicitações pendentes
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, company_name, current_position, industry')
        .eq('id', memberId)
        .single();
        
      if (memberData) {
        setPendingRequests(prev => [...prev, {
          id: memberId,
          name: memberData.name,
          avatar_url: memberData.avatar_url,
          company_name: memberData.company_name,
          current_position: memberData.current_position,
          industry: memberData.industry
        }]);
      }
      
      toast.success('Solicitação de conexão enviada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Não foi possível enviar a solicitação');
      return false;
    } finally {
      setProcessingRequest(false);
    }
  };

  return {
    connectedMembers,
    pendingRequests,
    isLoading,
    processingRequest,
    sendConnectionRequest
  };
};
