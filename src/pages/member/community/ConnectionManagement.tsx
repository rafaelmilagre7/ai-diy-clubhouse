
import { useState } from 'react';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { useConnectionRequests } from '@/hooks/community/useConnectionRequests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectionsTabContent } from '@/components/community/connections/ConnectionsTabContent';
import { PendingConnectionsTabContent } from '@/components/community/connections/PendingConnectionsTabContent';
import { ConnectionRequestsTabContent } from '@/components/community/connections/ConnectionRequestsTabContent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ConnectionMember } from '@/types/forumTypes';

const ConnectionManagement = () => {
  const { 
    connectedMembers, 
    pendingConnections, 
    isLoading: connectionsLoading
  } = useNetworkConnections();

  const {
    incomingRequests,
    incomingLoading,
    processingRequests,
    acceptConnectionRequest,
    rejectConnectionRequest
  } = useConnectionRequests();
  
  const [activeTab, setActiveTab] = useState('connections');

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['connection-members', [...connectedMembers, ...pendingConnections]],
    queryFn: async () => {
      const allIds = [...connectedMembers, ...pendingConnections];
      if (allIds.length === 0) return { connections: [] as ConnectionMember[], pending: [] as ConnectionMember[] };
      
      // Buscar informações dos membros
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, company_name, current_position, industry')
        .in('id', allIds);
      
      // Separar perfis de conexões e pendentes
      const connections: ConnectionMember[] = [];
      const pending: ConnectionMember[] = [];
      
      if (profiles) {
        profiles.forEach(profile => {
          // Corrigir a conversão de tipo criando um novo objeto tipado
          const typedProfile: ConnectionMember = {
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            company_name: profile.company_name,
            current_position: profile.current_position,
            industry: profile.industry
          };
          
          if (connectedMembers.has(profile.id)) {
            connections.push(typedProfile);
          } else if (pendingConnections.has(profile.id)) {
            pending.push(typedProfile);
          }
        });
      }
      
      return { connections, pending };
    },
    enabled: connectedMembers.size > 0 || pendingConnections.size > 0
  });

  const isLoading = connectionsLoading || membersLoading || incomingLoading;

  const handleAccept = async (memberId: string) => {
    try {
      await acceptConnectionRequest(memberId);
      toast.success("Solicitação de conexão aceita");
    } catch (error) {
      toast.error("Erro ao aceitar solicitação");
      console.error(error);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      await rejectConnectionRequest(memberId);
      toast.success("Solicitação de conexão rejeitada");
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação");
      console.error(error);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Minhas Conexões</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="connections">
            Conexões
          </TabsTrigger>
          <TabsTrigger value="pending">
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="requests">
            Recebidas
            {incomingRequests && incomingRequests.length > 0 && (
              <span className="ml-2 bg-viverblue text-white text-xs rounded-full px-2 py-0.5">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <>
            <TabsContent value="connections" className="mt-2">
              <ConnectionsTabContent 
                connections={membersData?.connections || []} 
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-2">
              <PendingConnectionsTabContent 
                pendingConnections={membersData?.pending || []} 
              />
            </TabsContent>

            <TabsContent value="requests" className="mt-2">
              <ConnectionRequestsTabContent 
                requests={incomingRequests} 
                processingRequests={processingRequests}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ConnectionManagement;
