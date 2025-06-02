
import React from 'react';
import { useNetworkConnections, useUpdateConnectionStatus } from '@/hooks/networking/useNetworkConnections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Clock,
  Building,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export const ConnectionsManager: React.FC = () => {
  const { data: pendingConnections, isLoading: pendingLoading } = useNetworkConnections('received');
  const { data: sentConnections, isLoading: sentLoading } = useNetworkConnections('sent');
  const { data: acceptedConnections, isLoading: acceptedLoading } = useNetworkConnections('accepted');
  const updateStatus = useUpdateConnectionStatus();

  const handleAccept = (connectionId: string) => {
    updateStatus.mutate({ connectionId, status: 'accepted' });
  };

  const handleReject = (connectionId: string) => {
    updateStatus.mutate({ connectionId, status: 'rejected' });
  };

  const ConnectionCard = ({ connection, showActions = false }: { connection: any; showActions?: boolean }) => {
    const user = connection.requester || connection.recipient;
    const isRequester = !!connection.requester;
    
    return (
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{user?.name || 'Usuário'}</h3>
              <Badge variant={
                connection.status === 'accepted' ? 'default' : 
                connection.status === 'pending' ? 'secondary' : 'destructive'
              }>
                {connection.status === 'accepted' ? 'Conectado' : 
                 connection.status === 'pending' ? 'Pendente' : 'Rejeitado'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-1">
              {user?.current_position || 'Posição não informada'}
            </p>
            
            {user?.company_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-3 w-3" />
                <span>{user.company_name}</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              {isRequester ? 'Solicitação enviada' : 'Quer se conectar com você'} • {new Date(connection.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        {showActions && connection.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              onClick={() => handleAccept(connection.id)}
              disabled={updateStatus.isPending}
              className="flex-1"
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleReject(connection.id)}
              disabled={updateStatus.isPending}
              className="flex-1"
            >
              <XCircle className="h-3 w-3" />
              Rejeitar
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-viverblue/10 rounded-lg">
          <Users className="h-6 w-6 text-viverblue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Minhas Conexões</h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões profissionais
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
            {pendingConnections && pendingConnections.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingConnections.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Conectados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Solicitações de conexão aguardando sua resposta
            </p>
          </div>
          
          {pendingLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
            </div>
          ) : pendingConnections && pendingConnections.length > 0 ? (
            <div className="space-y-4">
              {pendingConnections.map((connection) => (
                <ConnectionCard 
                  key={connection.id} 
                  connection={connection} 
                  showActions 
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação pendente</h3>
              <p className="text-muted-foreground">
                Quando alguém quiser se conectar com você, aparecerá aqui.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Solicitações que você enviou
            </p>
          </div>
          
          {sentLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
            </div>
          ) : sentConnections && sentConnections.length > 0 ? (
            <div className="space-y-4">
              {sentConnections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação enviada</h3>
              <p className="text-muted-foreground">
                Vá para a página de matches e comece a se conectar!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Suas conexões ativas
            </p>
          </div>
          
          {acceptedLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
            </div>
          ) : acceptedConnections && acceptedConnections.length > 0 ? (
            <div className="space-y-4">
              {acceptedConnections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conexão ainda</h3>
              <p className="text-muted-foreground">
                Aceite solicitações ou envie convites para começar a fazer networking!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
