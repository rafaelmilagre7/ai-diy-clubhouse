
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ConnectionMember } from '@/types/forumTypes';

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [connectedMembers, setConnectedMembers] = useState<ConnectionMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.log('useNetworkConnections: Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    console.log('useNetworkConnections: Carregando conexões para usuário', user.id);
    fetchConnections();
  }, [user?.id]);

  const fetchConnections = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Buscar conexões aceitas
      const { data: acceptedConnections, error: acceptedError } = await supabase
        .from('member_connections')
        .select(`
          id,
          requester_id,
          recipient_id,
          status,
          profiles!member_connections_requester_id_fkey (
            id, name, avatar_url, company_name, current_position, industry
          ),
          recipient_profile:profiles!member_connections_recipient_id_fkey (
            id, name, avatar_url, company_name, current_position, industry
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (acceptedError) {
        console.error('Erro ao buscar conexões aceitas:', acceptedError);
      } else {
        const connections: ConnectionMember[] = acceptedConnections?.map((conn: any) => {
          // Determinar qual perfil usar baseado no usuário atual
          const otherProfile = conn.requester_id === user.id 
            ? conn.recipient_profile 
            : conn.profiles;
          
          return {
            id: otherProfile?.id || '',
            name: otherProfile?.name || null,
            avatar_url: otherProfile?.avatar_url || null,
            company_name: otherProfile?.company_name || null,
            current_position: otherProfile?.current_position || null,
            industry: otherProfile?.industry || null
          };
        }).filter(conn => conn.id) || [];

        console.log('useNetworkConnections: Conexões aceitas carregadas:', connections.length);
        setConnectedMembers(connections);
      }
      
      // Buscar solicitações pendentes enviadas
      const { data: pendingConnections, error: pendingError } = await supabase
        .from('member_connections')
        .select(`
          id,
          recipient_id,
          recipient_profile:profiles!member_connections_recipient_id_fkey (
            id, name, avatar_url, company_name, current_position, industry
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');
        
      if (pendingError) {
        console.error('Erro ao buscar solicitações pendentes:', pendingError);
      } else {
        const pending: ConnectionMember[] = pendingConnections?.map((item: any) => ({
          id: item.recipient_profile?.id || '',
          name: item.recipient_profile?.name || null,
          avatar_url: item.recipient_profile?.avatar_url || null,
          company_name: item.recipient_profile?.company_name || null,
          current_position: item.recipient_profile?.current_position || null,
          industry: item.recipient_profile?.industry || null
        })).filter(req => req.id) || [];
        
        console.log('useNetworkConnections: Solicitações pendentes carregadas:', pending.length);
        setPendingRequests(pending);
      }
      
    } catch (error) {
      console.error('Erro ao buscar conexões:', error);
      toast.error('Não foi possível carregar suas conexões');
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (memberId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('useNetworkConnections: Usuário não autenticado');
      return false;
    }
    
    if (!memberId) {
      console.error('useNetworkConnections: ID do membro não fornecido');
      return false;
    }
    
    // Verificações rápidas antes de processar
    const isAlreadyConnected = connectedMembers.some(member => member.id === memberId);
    const isAlreadyPending = pendingRequests.some(request => request.id === memberId);
    
    if (isAlreadyConnected) {
      toast.info('Você já está conectado com este membro');
      return false;
    }
    
    if (isAlreadyPending) {
      toast.info('Você já enviou uma solicitação para este membro');
      return false;
    }

    setProcessingRequest(true);
    console.log('useNetworkConnections: Enviando solicitação de conexão para', memberId);

    try {
      // Verificar se já existe alguma conexão no banco
      const { count, error: countError } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${user.id})`);
        
      if (countError) {
        console.error('Erro ao verificar conexões existentes:', countError);
        throw countError;
      }
      
      if (count && count > 0) {
        toast.info('Já existe uma conexão ou solicitação com este membro');
        return false;
      }
      
      // Criar nova solicitação
      const { error: insertError } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: memberId,
          status: 'pending'
        });

      if (insertError) {
        console.error('Erro ao criar solicitação:', insertError);
        throw insertError;
      }
      
      // Buscar dados do membro para atualizar o estado local
      const { data: memberData, error: memberError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, company_name, current_position, industry')
        .eq('id', memberId)
        .single();
        
      if (memberError) {
        console.error('Erro ao buscar dados do membro:', memberError);
      } else if (memberData) {
        const newPendingRequest: ConnectionMember = {
          id: memberData.id,
          name: memberData.name,
          avatar_url: memberData.avatar_url,
          company_name: memberData.company_name,
          current_position: memberData.current_position,
          industry: memberData.industry
        };
        
        setPendingRequests(prev => [...prev, newPendingRequest]);
      }
      
      console.log('useNetworkConnections: Solicitação enviada com sucesso');
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
    sendConnectionRequest,
    refetch: fetchConnections
  };
};
