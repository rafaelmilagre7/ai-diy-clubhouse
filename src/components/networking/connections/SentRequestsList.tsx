import { Loader2, AlertCircle, Send, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SentRequestsList = () => {
  const { sentRequests, isLoading, error } = useSentRequests();
  const { cancelRequest, isCancelingRequest } = useConnections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar solicitações enviadas. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <Send className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Nenhuma solicitação enviada
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Você ainda não enviou nenhuma solicitação de conexão
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Solicitações Enviadas ({sentRequests.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {sentRequests.map((request) => {
          const recipient = request.recipient;
          if (!recipient) return null;

          return (
            <Card key={request.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={recipient.avatar_url} alt={recipient.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {recipient.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h4 className="font-semibold text-foreground truncate">
                      {recipient.name}
                    </h4>
                    {recipient.current_position && (
                      <p className="text-sm text-muted-foreground truncate">
                        {recipient.current_position}
                        {recipient.company_name && ` • ${recipient.company_name}`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 text-xs">
                      <Send className="h-3 w-3" />
                      Enviada {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelRequest(request.id)}
                  disabled={isCancelingRequest}
                  className="shrink-0 gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
