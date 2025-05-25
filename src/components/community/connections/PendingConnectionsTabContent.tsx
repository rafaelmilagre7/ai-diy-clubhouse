
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, Clock, X } from 'lucide-react';
import { getInitials } from '@/components/community/utils/membership';

interface PendingConnectionsTabContentProps {
  pendingConnections: any[];
  onCancelRequest: (recipientId: string) => void;
}

export const PendingConnectionsTabContent = ({
  pendingConnections,
  onCancelRequest
}: PendingConnectionsTabContentProps) => {
  if (pendingConnections.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Nenhuma solicitação enviada</h3>
        <p className="text-muted-foreground">
          Você não enviou nenhuma solicitação de conexão pendente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingConnections.map((connection) => {
        const recipient = connection.recipient;
        
        return (
          <Card key={connection.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={recipient?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(recipient?.name || 'Usuário')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{recipient?.name || 'Usuário'}</CardTitle>
                    {recipient?.current_position && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {recipient.current_position}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-amber-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Aguardando resposta
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onCancelRequest(connection.recipient_id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </CardHeader>
            
            {recipient?.company_name && (
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  {recipient.company_name}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
