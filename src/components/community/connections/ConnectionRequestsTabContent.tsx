
import React from 'react';
import { ConnectionRequestCard } from './ConnectionRequestCard';
import { useConnectionsManagement } from '@/hooks/community/useConnectionsManagement';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export const ConnectionRequestsTabContent = () => {
  const { 
    pendingRequests, 
    acceptConnection, 
    rejectConnection, 
    isLoading, 
    isProcessing 
  } = useConnectionsManagement();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-grow">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação pendente</h3>
          <p className="text-muted-foreground">
            Quando outros membros solicitarem conexão, as solicitações aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request) => (
        <ConnectionRequestCard
          key={request.id}
          request={request}
          onAccept={acceptConnection}
          onReject={rejectConnection}
          isProcessing={isProcessing}
        />
      ))}
    </div>
  );
};
