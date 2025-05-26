
import React from 'react';
import { ConnectionCard } from './ConnectionCard';
import { useConnectionsManagement } from '@/hooks/community/useConnectionsManagement';
import { useDirectMessages } from '@/hooks/community/useDirectMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const ConnectionsTabContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connections, removeConnection, isLoading } = useConnectionsManagement();
  const { sendMessage } = useDirectMessages();

  const handleStartConversation = (memberId: string) => {
    // Redirecionar para a página de mensagens
    navigate('/comunidade/mensagens');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
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

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma conexão ainda</h3>
          <p className="text-muted-foreground">
            Quando você se conectar com outros membros, eles aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        // Determinar qual perfil mostrar (o outro usuário na conexão)
        const member = connection.requester_id === user?.id ? connection.recipient : connection.requester;
        
        return (
          <ConnectionCard
            key={connection.id}
            member={{
              id: member.id,
              name: member.name,
              avatar_url: member.avatar_url,
              company_name: member.company_name,
              current_position: member.current_position
            }}
            onRemoveConnection={() => removeConnection(connection.id)}
            onStartConversation={handleStartConversation}
          />
        );
      })}
    </div>
  );
};
