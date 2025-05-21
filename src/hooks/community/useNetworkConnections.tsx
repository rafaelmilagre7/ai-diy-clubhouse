
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ConnectionMember } from '@/types/forumTypes';

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [connectedMembers, setConnectedMembers] = useState<Set<string>>(new Set());
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    fetchNetworkConnections();
    
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
          fetchNetworkConnections();
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
          fetchNetworkConnections();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
  // Buscar conexões do usuário
  const fetchNetworkConnections = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Buscar conexões aceitas (onde o usuário é o solicitante)
      const { data: sentConnections } = await supabase
        .from('member_connections')
        .select('recipient_id, status')
        .eq('requester_id', user.id);
        
      // Buscar conexões aceitas (onde o usuário é o destinatário)
      const { data: receivedConnections } = await supabase
        .from('member_connections')
        .select('requester_id, status')
        .eq('recipient_id', user.id);
        
      // Processar conexões aceitas
      const connected = new Set<string>();
      const pending = new Set<string>();
      
      sentConnections?.forEach(conn => {
        if (conn.status === 'accepted') {
          connected.add(conn.recipient_id);
        } else if (conn.status === 'pending') {
          pending.add(conn.recipient_id);
        }
      });
      
      receivedConnections?.forEach(conn => {
        if (conn.status === 'accepted') {
          connected.add(conn.requester_id);
        }
      });
      
      setConnectedMembers(connected);
      setPendingConnections(pending);
    } catch (error) {
      console.error('Erro ao buscar conexões:', error);
      toast.error('Não foi possível carregar suas conexões');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enviar solicitação de conexão
  const sendConnectionRequest = async (memberId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Verificar se já existe uma conexão
      const { data: existingConnection } = await supabase
        .from('member_connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${user.id})`)
        .single();
      
      if (existingConnection) {
        if (existingConnection.status === 'pending') {
          toast.info('Você já tem uma solicitação pendente com este membro');
        } else if (existingConnection.status === 'accepted') {
          toast.info('Vocês já estão conectados');
        } else {
          toast.info('Não é possível enviar solicitação para este membro');
        }
        return false;
      }
      
      // Criar nova solicitação
      const { error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: user.id,
          recipient_id: memberId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      // Atualizar estado local
      setPendingConnections(prev => new Set([...prev, memberId]));
      return true;
    } catch (error) {
      console.error('Erro ao enviar solicitação de conexão:', error);
      toast.error('Não foi possível enviar a solicitação de conexão');
      return false;
    }
  };
  
  return {
    connectedMembers,
    pendingConnections,
    isLoading,
    sendConnectionRequest,
    refreshConnections: fetchNetworkConnections
  };
};
