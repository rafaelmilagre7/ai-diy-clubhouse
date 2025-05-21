
import { useState } from 'react';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyTopicsState } from '@/components/community/EmptyTopicsState';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface ConnectionMember {
  id: string;
  name: string;
  avatar_url: string | null;
  company_name: string | null;
  current_position: string | null;
  industry: string | null;
}

const ConnectionManagement = () => {
  const { 
    connectedMembers, 
    pendingConnections, 
    isLoading: connectionsLoading,
    acceptConnectionRequest,
    rejectConnectionRequest,
  } = useNetworkConnections();
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['connection-members', [...connectedMembers, ...pendingConnections]],
    queryFn: async () => {
      const allIds = [...connectedMembers, ...pendingConnections];
      if (allIds.length === 0) return { connections: [], pending: [] };
      
      // Buscar informações dos membros
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, company_name, current_position, industry')
        .in('id', allIds);
      
      // Separar perfis de conexões e pendentes
      const connections: ConnectionMember[] = [];
      const pending: ConnectionMember[] = [];
      
      profiles?.forEach(profile => {
        if (connectedMembers.has(profile.id)) {
          connections.push(profile as ConnectionMember);
        } else if (pendingConnections.has(profile.id)) {
          pending.push(profile as ConnectionMember);
        }
      });
      
      return { connections, pending };
    },
    enabled: connectedMembers.size > 0 || pendingConnections.size > 0
  });

  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ['incoming-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Buscar solicitações recebidas
      const { data: requests } = await supabase
        .from('member_connections')
        .select(`
          requester_id,
          profiles:requester_id (
            id, 
            name, 
            avatar_url, 
            company_name, 
            current_position,
            industry
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');
      
      return requests?.map(r => r.profiles) || [];
    },
    enabled: !!user?.id
  });

  const isLoading = connectionsLoading || membersLoading || incomingLoading;

  const handleAccept = async (memberId: string) => {
    setProcessingRequests(prev => new Set(prev).add(memberId));
    try {
      await acceptConnectionRequest(memberId);
      toast.success("Solicitação de conexão aceita");
    } catch (error) {
      toast.error("Erro ao aceitar solicitação");
      console.error(error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const handleReject = async (memberId: string) => {
    setProcessingRequests(prev => new Set(prev).add(memberId));
    try {
      await rejectConnectionRequest(memberId);
      toast.success("Solicitação de conexão rejeitada");
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação");
      console.error(error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Minhas Conexões</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="connections">
            Conexões
          </TabsTrigger>
          <TabsTrigger value="pending">
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="requests">
            Recebidas
            {incomingRequests && incomingRequests.length > 0 && (
              <span className="ml-2 bg-viverblue text-white text-xs rounded-full px-2 py-0.5">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <>
            <TabsContent value="connections" className="mt-2">
              {membersData?.connections && membersData.connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersData.connections.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <Link to={`/comunidade/membro/${member.id}`} className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.current_position || ""}
                              {member.current_position && member.company_name && " • "}
                              {member.company_name || ""}
                            </p>
                            {member.industry && (
                              <p className="text-xs text-muted-foreground">{member.industry}</p>
                            )}
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyTopicsState searchQuery="Você ainda não tem conexões" />
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-2">
              {membersData?.pending && membersData.pending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersData.pending.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-grow">
                            <Link to={`/comunidade/membro/${member.id}`} className="font-medium hover:underline">
                              {member.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {member.current_position || ""}
                              {member.current_position && member.company_name && " • "}
                              {member.company_name || ""}
                            </p>
                            <p className="text-xs text-muted-foreground italic">
                              Solicitação enviada
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyTopicsState searchQuery="Você não tem solicitações pendentes" />
              )}
            </TabsContent>

            <TabsContent value="requests" className="mt-2">
              {incomingRequests && incomingRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incomingRequests.map((member: ConnectionMember) => (
                    <Card key={member.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url || undefined} alt={member.name || "Usuário"} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-grow">
                            <Link to={`/comunidade/membro/${member.id}`} className="font-medium hover:underline">
                              {member.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {member.current_position || ""}
                              {member.current_position && member.company_name && " • "}
                              {member.company_name || ""}
                            </p>
                            
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleReject(member.id)}
                                disabled={processingRequests.has(member.id)}
                              >
                                {processingRequests.has(member.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-1" />
                                    <span>Recusar</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8"
                                onClick={() => handleAccept(member.id)}
                                disabled={processingRequests.has(member.id)}
                              >
                                {processingRequests.has(member.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    <span>Aceitar</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyTopicsState searchQuery="Você não tem solicitações recebidas" />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ConnectionManagement;
