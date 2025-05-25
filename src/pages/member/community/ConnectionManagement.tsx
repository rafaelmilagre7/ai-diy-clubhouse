
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Clock, UserCheck } from 'lucide-react';
import { ConnectionsTabContent } from '@/components/community/connections/ConnectionsTabContent';
import { ConnectionRequestsTabContent } from '@/components/community/connections/ConnectionRequestsTabContent';
import { PendingConnectionsTabContent } from '@/components/community/connections/PendingConnectionsTabContent';
import { useConnectionsManagement } from '@/hooks/community/useConnectionsManagement';

const ConnectionManagement = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const { connections, pendingRequests, sentRequests } = useConnectionsManagement();

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.length}</p>
                <p className="text-sm text-muted-foreground">Conexões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Solicitações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sentRequests.length}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de gerenciamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Conexões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Minhas Conexões
                {connections.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {connections.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Solicitações
                {pendingRequests.length > 0 && (
                  <Badge variant="default" className="ml-1">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Enviadas
                {sentRequests.length > 0 && (
                  <Badge variant="outline" className="ml-1">
                    {sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="connections" className="mt-0">
                <ConnectionsTabContent />
              </TabsContent>
              
              <TabsContent value="requests" className="mt-0">
                <ConnectionRequestsTabContent />
              </TabsContent>
              
              <TabsContent value="sent" className="mt-0">
                <PendingConnectionsTabContent />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionManagement;
