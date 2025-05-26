import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumHeader } from '@/components/community/ForumHeader';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { ConnectionRequestsTabContent } from '@/components/community/connections/ConnectionRequestsTabContent';
import { PendingConnectionsTabContent } from '@/components/community/connections/PendingConnectionsTabContent';
import { ConnectionsTabContent } from '@/components/community/connections/ConnectionsTabContent';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MemberConnection } from '@/types/forumTypes';

const ConnectionManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  const [processingRequests, setProcessingRequests] = useState(new Set<string>());
  
  // Buscar conexões onde o usuário é o destinatário (solicitações recebidas)
  const { data: connectionRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['connection-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_connections')
        .select('*, requester:requester_id(id, name, avatar_url, company_name, current_position)')
        .eq('recipient_id', user?.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Buscar conexões pendentes enviadas pelo usuário
  const { data: pendingConnections, refetch: refetchPending } = useQuery({
    queryKey: ['pending-connections', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_connections')
        .select('*, recipient:recipient_id(id, name, avatar_url, company_name, current_position)')
        .eq('requester_id', user?.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Buscar conexões aceitas
  const { data: connections, refetch: refetchConnections } = useQuery({
    queryKey: ['active-connections', user?.id],
    queryFn: async () => {
      const { data: sentConnections, error: sentError } = await supabase
        .from('member_connections')
        .select('*, connection:recipient_id(id, name, avatar_url, company_name, current_position)')
        .eq('requester_id', user?.id)
        .eq('status', 'accepted');
        
      if (sentError) throw sentError;
      
      const { data: receivedConnections, error: receivedError } = await supabase
        .from('member_connections')
        .select('*, connection:requester_id(id, name, avatar_url, company_name, current_position)')
        .eq('recipient_id', user?.id)
        .eq('status', 'accepted');
        
      if (receivedError) throw receivedError;
      
      return [...(sentConnections || []), ...(receivedConnections || [])];
    },
    enabled: !!user?.id
  });
  
  // Funções para aceitar/rejeitar solicitações
  const handleAcceptRequest = async (requesterId: string): Promise<boolean> => {
    setProcessingRequests(prev => new Set(prev).add(requesterId));
    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Solicitação de conexão aceita!');
      refetchRequests();
      refetchConnections();
      return true;
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast.error('Não foi possível aceitar a solicitação.');
      return false;
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };
  
  const handleRejectRequest = async (requesterId: string): Promise<boolean> => {
    setProcessingRequests(prev => new Set(prev).add(requesterId));
    try {
      const { error } = await supabase
        .from('member_connections')
        .update({ status: 'rejected' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Solicitação de conexão rejeitada.');
      refetchRequests();
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Não foi possível rejeitar a solicitação.');
      return false;
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };
  
  // Função para cancelar solicitação pendente
  const handleCancelRequest = async (recipientId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('requester_id', user?.id)
        .eq('recipient_id', recipientId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      toast.success('Solicitação de conexão cancelada.');
      refetchPending();
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      toast.error('Não foi possível cancelar a solicitação.');
    }
  };
  
  // Função para remover uma conexão
  const handleRemoveConnection = async (connectionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('member_connections')
        .delete()
        .eq('id', connectionId);
      
      if (error) throw error;
      
      toast.success('Conexão removida com sucesso.');
      refetchConnections();
    } catch (error) {
      console.error('Erro ao remover conexão:', error);
      toast.error('Não foi possível remover a conexão.');
    }
  };
  
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <ForumBreadcrumbs 
        section="conexoes" 
        sectionTitle="Gerenciar Conexões" 
      />
      
      <ForumHeader 
        title="Gerenciar Conexões" 
        description="Gerencie suas conexões com outros membros da comunidade"
      />
      
      <CommunityNavigation />
      
      <div className="mt-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="connections">
              Minhas Conexões
              {connections?.length ? ` (${connections.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Solicitações Recebidas
              {connectionRequests?.length ? ` (${connectionRequests.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Solicitações Enviadas
              {pendingConnections?.length ? ` (${pendingConnections.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections">
            <ConnectionsTabContent 
              connections={connections || []} 
              onRemoveConnection={handleRemoveConnection}
            />
          </TabsContent>
          
          <TabsContent value="requests">
            <ConnectionRequestsTabContent 
              requests={connectionRequests || []} 
              processingRequests={processingRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <PendingConnectionsTabContent 
              pendingConnections={pendingConnections || []} 
              onCancelRequest={handleCancelRequest}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectionManagement;
