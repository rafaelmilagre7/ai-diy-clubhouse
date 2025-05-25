
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { getInitials } from '@/utils/user';
import { ConnectionRequest } from '@/hooks/community/useConnectionsManagement';

interface PendingConnectionCardProps {
  request: ConnectionRequest;
}

export const PendingConnectionCard: React.FC<PendingConnectionCardProps> = ({ request }) => {
  const recipient = request.recipient;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.name || "Usuário"} />
            <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-grow">
            <p className="font-medium">{recipient.name}</p>
            <p className="text-sm text-muted-foreground">
              {recipient.current_position || ""}
              {recipient.current_position && recipient.company_name && " • "}
              {recipient.company_name || ""}
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Enviado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="text-sm text-yellow-600 font-medium">
            Pendente
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
