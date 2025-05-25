
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Clock } from 'lucide-react';
import { getInitials } from '@/utils/user';
import { ConnectionRequest } from '@/hooks/community/useConnectionsManagement';

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  isProcessing = false
}) => {
  const requester = request.requester;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-grow">
            <Avatar className="h-12 w-12">
              <AvatarImage src={requester.avatar_url || undefined} alt={requester.name || "Usuário"} />
              <AvatarFallback>{getInitials(requester.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-grow">
              <p className="font-medium">{requester.name}</p>
              <p className="text-sm text-muted-foreground">
                {requester.current_position || ""}
                {requester.current_position && requester.company_name && " • "}
                {requester.company_name || ""}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(request.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onAccept(request.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(request.id)}
              disabled={isProcessing}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
