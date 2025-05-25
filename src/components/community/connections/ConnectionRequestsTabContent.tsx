
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, Check, X } from 'lucide-react';
import { getInitials } from '@/components/community/utils/membership';

interface ConnectionRequestsTabContentProps {
  requests: any[];
  processingRequests: Set<string>;
  onAccept: (requesterId: string) => Promise<boolean>;
  onReject: (requesterId: string) => Promise<boolean>;
}

export const ConnectionRequestsTabContent = ({
  requests,
  processingRequests,
  onAccept,
  onReject
}: ConnectionRequestsTabContentProps) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Nenhuma solicitação pendente</h3>
        <p className="text-muted-foreground">
          Você não tem solicitações de conexão pendentes no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const requester = request.requester;
        const isProcessing = processingRequests.has(request.requester_id);
        
        return (
          <Card key={request.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={requester?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(requester?.name || 'Usuário')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{requester?.name || 'Usuário'}</CardTitle>
                    {requester?.current_position && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {requester.current_position}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => onAccept(request.requester_id)}
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isProcessing ? 'Processando...' : 'Aceitar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => onReject(request.requester_id)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {isProcessing ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {requester?.company_name && (
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  {requester.company_name}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
