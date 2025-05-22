
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { useConnectionRequests } from '@/hooks/community/useConnectionRequests';
import { ConnectionsTabContent } from '@/components/community/connections/ConnectionsTabContent';
import { ConnectionRequestsTabContent } from '@/components/community/connections/ConnectionRequestsTabContent';
import { PendingConnectionsTabContent } from '@/components/community/connections/PendingConnectionsTabContent';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const ConnectionManagement: React.FC = () => {
  const { connectedMembers, pendingRequests, isLoading: connectionsLoading } = useNetworkConnections();
  const { incomingRequests, incomingLoading, newRequestsCount } = useConnectionRequests();
  const [activeTab, setActiveTab] = useState('connections');

  // Para futura implementação de gamificação e loja de comunidade
  // const [points, setPoints] = useState(0);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="bg-card border-border/40">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="connections">
              Minhas conexões ({connectedMembers.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Solicitações recebidas
              {newRequestsCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs h-5 min-w-5 px-1 flex items-center justify-center">
                  {newRequestsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Solicitações enviadas ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-2">
            <ConnectionsTabContent 
              connections={connectedMembers} 
            />
          </TabsContent>

          <TabsContent value="requests" className="mt-2">
            <ConnectionRequestsTabContent 
              requests={incomingRequests}
              isLoading={incomingLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-2">
            <PendingConnectionsTabContent 
              pendingRequests={pendingRequests}
              isLoading={connectionsLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Para futura implementação do sistema de gamificação e loja da comunidade */}
        {/* 
        <div className="mt-10 p-4 border border-dashed border-neutral-700 rounded-md">
          <h3 className="text-lg font-medium text-neutral-200 mb-2">Sistema de Gamificação</h3>
          <p className="text-neutral-400">
            Em breve você poderá ganhar pontos por participar ativamente na comunidade e
            trocar por benefícios exclusivos na loja da comunidade.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Trophy className="text-amber-400 h-5 w-5" />
            <span className="text-neutral-300">Seus pontos: <span className="font-medium">{points}</span></span>
          </div>
        </div>
        */}
      </CardContent>
    </Card>
  );
};

export default ConnectionManagement;
