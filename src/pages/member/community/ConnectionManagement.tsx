
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnectionRequests } from '@/hooks/community/useConnectionRequests';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { ConnectionCard } from '@/components/community/connections/ConnectionCard';
import { ConnectionRequestCard } from '@/components/community/connections/ConnectionRequestCard';
import { PendingConnectionCard } from '@/components/community/connections/PendingConnectionCard';
import { Skeleton } from '@/components/ui/skeleton';

const ConnectionManagement = () => {
  const [activeTab, setActiveTab] = useState('connections');
  
  const { 
    connectedMembers, 
    pendingRequests, 
    isLoading: connectionsLoading 
  } = useNetworkConnections();
  
  const { 
    incomingRequests, 
    incomingLoading,
    processingRequests,
    acceptConnectionRequest,
    rejectConnectionRequest
  } = useConnectionRequests();
  
  // Calcular contagens para badges
  const pendingCount = pendingRequests.length + incomingRequests.length;
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections">
            Suas Conexões ({connectedMembers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections" className="mt-6">
          {connectionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(index => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : connectedMembers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {connectedMembers.map(member => (
                <ConnectionCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-lg font-medium mb-2">Você ainda não tem conexões</p>
              <p className="text-muted-foreground">
                Encontre outros membros na comunidade e conecte-se com eles
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {(incomingLoading || connectionsLoading) ? (
            <div className="space-y-3">
              {[1, 2].map(index => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {incomingRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Solicitações Recebidas</h3>
                  <div className="space-y-3">
                    {incomingRequests.map(member => (
                      <ConnectionRequestCard
                        key={member.id}
                        member={member}
                        onAccept={acceptConnectionRequest}
                        onReject={rejectConnectionRequest}
                        isProcessing={processingRequests.has(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {pendingRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Solicitações Enviadas</h3>
                  <div className="space-y-3">
                    {pendingRequests.map(member => (
                      <PendingConnectionCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}
              
              {incomingRequests.length === 0 && pendingRequests.length === 0 && (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-lg font-medium mb-2">Nenhuma solicitação pendente</p>
                  <p className="text-muted-foreground">
                    Você não tem solicitações de conexão pendentes no momento
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionManagement;
