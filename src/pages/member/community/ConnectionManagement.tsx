
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, UserCheck, UserPlus, MessageSquare } from 'lucide-react';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { getInitials } from '@/utils/user';
import { useNavigate } from 'react-router-dom';

const ConnectionManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { connectedMembers, pendingRequests, isLoading } = useNetworkConnections();

  const filteredConnections = connectedMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMessage = (memberId: string) => {
    navigate('/comunidade/mensagens', { 
      state: { selectedMemberId: memberId } 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Conexões ({connectedMembers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conexões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredConnections.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Nenhuma conexão encontrada' : 'Nenhuma conexão ainda'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm 
                    ? 'Tente ajustar sua busca ou explorar novos membros para conectar.'
                    : 'Comece a construir sua rede conectando-se com outros membros da comunidade.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/comunidade/membros')}
                  >
                    Explorar membros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{member.name || 'Usuário'}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.current_position || 'Profissional'}
                        </p>
                      </div>
                    </div>
                    
                    {member.company_name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {member.company_name}
                      </p>
                    )}
                    
                    {member.industry && (
                      <Badge variant="secondary" className="mb-4">
                        {member.industry}
                      </Badge>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleMessage(member.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar mensagem
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação pendente</h3>
                <p className="text-muted-foreground max-w-md">
                  Você não tem solicitações de conexão pendentes no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{member.name || 'Usuário'}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.current_position || 'Profissional'}
                        </p>
                      </div>
                    </div>
                    
                    {member.company_name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {member.company_name}
                      </p>
                    )}
                    
                    <Badge variant="outline" className="mb-4">
                      Solicitação enviada
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionManagement;
