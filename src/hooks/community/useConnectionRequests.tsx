
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ConnectionMember } from '@/types/forumTypes';

export const useConnectionRequests = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<ConnectionMember[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setIncomingLoading(false);
      return;
    }

    const fetchIncomingRequests = async () => {
      try {
        setIncomingLoading(true);
        
        // Buscar solicitações recebidas pendentes
        const { data, error } = await supabase
          .from('member_connections')
          .select(`
            id,
            requester_id,
            profiles:requester_id (
              id,
              name,
              avatar_url,
              company_name,
              current_position,
              industry
            )
          `)
          .eq('recipient_id', user.id)
          .eq('status', 'pending');

        if (error) throw error;

        // Processar os dados para o formato ConnectionMember
        const requests: ConnectionMember[] = data?.map((item: any) => ({
          id: item.requester_id,
          name: item.profiles?.name || null,
          avatar_url: item.profiles?.avatar_url || null,
          company_name: item.profiles?.company_name || null,
          current_position: item.profiles?.current_position || null,
          industry: item.profiles?.industry || null
        })) || [];

        setIncomingRequests(requests);
        setNewRequestsCount(requests.length);
      } catch (error) {
        console.error('Erro ao buscar solicitações de conexão:', error);
        toast.error('Não foi possível carregar as solicitações de conexão');
      } finally {
        setIncomingLoading(false);
      }
    };

    fetchIncomingRequests();

    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('member_connections_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'member_connections',
          filter: `recipient_id=eq.${user.id}`
        }, 
        () => {
          // Quando houver mudança na tabela, atualizar solicitações
          fetchIncomingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Aceitar uma solicitação de conexão
  const acceptConnectionRequest = async (requesterId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setProcessingRequests(prev => new Set([...prev, requesterId]));

    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      // Remover solicitação da lista de pendentes
      setIncomingRequests(prev => prev.filter(request => request.id !== requesterId));
      setNewRequestsCount(prev => Math.max(0, prev - 1));
      toast.success('Solicitação aceita com sucesso');
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast.error('Não foi possível aceitar a solicitação');
      return false;
    } finally {
      setProcessingRequests(prev => {
        const updated = new Set([...prev]);
        updated.delete(requesterId);
        return updated;
      });
    }
  };

  // Rejeitar uma solicitação de conexão
  const rejectConnectionRequest = async (requesterId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setProcessingRequests(prev => new Set([...prev, requesterId]));

    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      // Remover solicitação da lista de pendentes
      setIncomingRequests(prev => prev.filter(request => request.id !== requesterId));
      setNewRequestsCount(prev => Math.max(0, prev - 1));
      toast.success('Solicitação rejeitada');
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Não foi possível rejeitar a solicitação');
      return false;
    } finally {
      setProcessingRequests(prev => {
        const updated = new Set([...prev]);
        updated.delete(requesterId);
        return updated;
      });
    }
  };

  return {
    incomingRequests,
    incomingLoading,
    processingRequests,
    newRequestsCount,
    acceptConnectionRequest,
    rejectConnectionRequest
  };
};
