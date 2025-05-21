
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ConnectionMember } from '@/types/forumTypes';

export const useConnectionRequests = () => {
  const { user } = useAuth();
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ['incoming-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as ConnectionMember[];
      
      // Buscar solicitações recebidas
      const { data: requests } = await supabase
        .from('member_connections')
        .select(`
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
      
      // Converter e garantir que sejam do tipo correto
      const memberRequests: ConnectionMember[] = [];
      
      if (requests) {
        requests.forEach((req: any) => {
          if (req.profiles) {
            // Criar objeto tipado corretamente
            const member: ConnectionMember = {
              id: req.profiles.id,
              name: req.profiles.name,
              avatar_url: req.profiles.avatar_url,
              company_name: req.profiles.company_name,
              current_position: req.profiles.current_position,
              industry: req.profiles.industry
            };
            memberRequests.push(member);
          }
        });
      }
      
      return memberRequests;
    },
    enabled: !!user?.id
  });

  const acceptConnectionRequest = async (memberId: string) => {
    if (!user) return;
    
    setProcessingRequests(prev => new Set(prev).add(memberId));
    
    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('requester_id', memberId)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erro ao aceitar solicitação:', error);
      throw error;
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const rejectConnectionRequest = async (memberId: string) => {
    if (!user) return;
    
    setProcessingRequests(prev => new Set(prev).add(memberId));
    
    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('requester_id', memberId)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erro ao rejeitar solicitação:', error);
      throw error;
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  return {
    incomingRequests: incomingRequests || [],
    incomingLoading,
    processingRequests,
    acceptConnectionRequest,
    rejectConnectionRequest
  };
};
