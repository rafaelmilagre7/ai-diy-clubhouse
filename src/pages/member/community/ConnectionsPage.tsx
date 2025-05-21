
import { useState } from 'react';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumHeader } from '@/components/community/ForumHeader';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectionRequests } from '@/hooks/community/useConnectionRequests';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, Briefcase, Loader2 } from 'lucide-react';
import { getInitials } from '@/utils/user';

export const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState('connections');
  
  const { 
    incomingRequests, 
    incomingLoading, 
    processingRequests,
    acceptConnectionRequest,
    rejectConnectionRequest 
  } = useConnectionRequests();
  
  const {
    connectedMembers,
    pendingRequests,
    isLoading
  } = useNetworkConnections();
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="conexoes"
        sectionTitle="Minhas Conexões"
      />
      
      <ForumHeader
        title="Minhas Conexões"
        description="Gerencie suas conexões e solicitações da comunidade."
        showNewTopicButton={false}
      />
      
      <CommunityNavigation />
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="connections">
            Conexões
            {connectedMembers.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                {connectedMembers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Solicitações Recebidas
            {incomingRequests.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : connectedMembers.length === 0 ? (
            <div className="text-center p-12 border rounded-lg border-dashed">
              <h3 className="text-lg font-medium mb-2">Você ainda não tem conexões</h3>
              <p className="text-muted-foreground mb-4">
                Conecte-se com outros profissionais explorando o diretório de membros.
              </p>
              <Button asChild>
                <a href="/comunidade/membros">Explorar Membros</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedMembers.map(member => (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="pb-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || ''} alt={member.name || 'Membro'} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(member.name || 'Membro')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{member.name}</h3>
                        {member.current_position && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{member.current_position}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-1">
                    {member.company_name && (
                      <div className="flex items-center text-sm gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{member.company_name}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        asChild
                      >
                        <a href={`/comunidade/membro/${member.id}`}>Ver Perfil</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          {incomingLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center p-12 border rounded-lg border-dashed">
              <h3 className="text-lg font-medium mb-2">Nenhuma solicitação recebida</h3>
              <p className="text-muted-foreground">
                Você não tem solicitações de conexão pendentes no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomingRequests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar_url || ''} alt={request.name || 'Membro'} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(request.name || 'Membro')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{request.name}</h3>
                        {request.current_position && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{request.current_position}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-1">
                    {request.company_name && (
                      <div className="flex items-center text-sm gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{request.company_name}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => rejectConnectionRequest(request.id)}
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Recusar'
                        )}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => acceptConnectionRequest(request.id)}
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Aceitar'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center p-12 border rounded-lg border-dashed">
              <h3 className="text-lg font-medium mb-2">Nenhuma solicitação pendente</h3>
              <p className="text-muted-foreground mb-4">
                Você não tem solicitações de conexão enviadas pendentes.
              </p>
              <Button asChild>
                <a href="/comunidade/membros">Explorar Membros</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar_url || ''} alt={request.name || 'Membro'} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(request.name || 'Membro')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{request.name}</h3>
                        {request.current_position && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{request.current_position}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-1">
                    {request.company_name && (
                      <div className="flex items-center text-sm gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{request.company_name}</span>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        disabled
                      >
                        Solicitação Enviada
                      </Button>
                    </div>
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

export default ConnectionsPage;
