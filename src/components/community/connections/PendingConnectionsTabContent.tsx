
import React from 'react';
import { PendingConnectionCard } from './PendingConnectionCard';
import { useConnectionsManagement } from '@/hooks/community/useConnectionsManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const PendingConnectionsTabContent = () => {
  const { sentRequests, isLoading } = useConnectionsManagement();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação enviada</h3>
          <p className="text-muted-foreground">
            Suas solicitações de conexão enviadas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sentRequests.map((request) => (
        <PendingConnectionCard
          key={request.id}
          request={request}
        />
      ))}
    </div>
  );
};
