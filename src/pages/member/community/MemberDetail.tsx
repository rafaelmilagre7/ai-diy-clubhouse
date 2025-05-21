
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/forumTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Building2, Calendar, Mail, Loader2, Link as LinkIcon, LinkedinIcon } from 'lucide-react';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { getInitials } from '@/utils/user';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MemberDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    connectedMembers, 
    pendingRequests, 
    sendConnectionRequest, 
    processingRequest 
  } = useNetworkConnections();
  
  // Verificar o status da conexão
  const connectionStatus = () => {
    if (connectedMembers.some(member => member.id === memberId)) {
      return 'connected';
    }
    if (pendingRequests.some(request => request.id === memberId)) {
      return 'pending';
    }
    return 'none';
  };
  
  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!memberId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', memberId)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Erro ao carregar perfil do membro:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberProfile();
  }, [memberId]);
  
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <ForumBreadcrumbs 
          section="membro"
          sectionTitle="Perfil de Membro"
        />
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Membro não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/comunidade/membros">Voltar para Diretório de Membros</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Formatar memberSince de forma segura, verificando se created_at existe
  const memberSince = profile.created_at 
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : "Data desconhecida";
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="membro"
        sectionTitle={profile.name || "Perfil de Membro"}
      />
      
      <CommunityNavigation />
      
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || "Membro"} />
                <AvatarFallback className="text-xl">
                  {getInitials(profile.name || "Membro")}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                {profile.current_position && (
                  <div className="flex items-center justify-center text-muted-foreground mt-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{profile.current_position}</span>
                  </div>
                )}
              </div>
              
              {profile.industry && (
                <Badge variant="secondary" className="mt-2">
                  {profile.industry}
                </Badge>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground mt-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Membro desde {memberSince}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {profile.company_name && (
                  <div>
                    <div className="flex items-center text-sm mb-1">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="font-medium">Empresa</span>
                    </div>
                    <p className="pl-6">{profile.company_name}</p>
                  </div>
                )}
                
                {profile.email && (
                  <div>
                    <div className="flex items-center text-sm mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="pl-6 break-all">{profile.email}</p>
                  </div>
                )}
                
                {profile.linkedin_url && (
                  <div>
                    <div className="flex items-center text-sm mb-1">
                      <LinkedinIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">LinkedIn</span>
                    </div>
                    <a 
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pl-6 text-primary hover:underline flex items-center"
                    >
                      <span className="truncate">Ver perfil</span>
                      <LinkIcon className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                
                <div className="pt-4">
                  {connectionStatus() === 'connected' ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Conectado
                    </Button>
                  ) : connectionStatus() === 'pending' ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Solicitação Enviada
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => sendConnectionRequest(memberId || '')}
                      disabled={processingRequest}
                    >
                      {processingRequest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Conectar'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="sobre">
                <TabsList className="mb-4">
                  <TabsTrigger value="sobre">Sobre</TabsTrigger>
                  <TabsTrigger value="atividade">Atividade</TabsTrigger>
                </TabsList>
                
                <TabsContent value="sobre" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Biografia Profissional</h3>
                    {profile.professional_bio ? (
                      <p className="text-muted-foreground whitespace-pre-line">
                        {profile.professional_bio}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Nenhuma biografia disponível.
                      </p>
                    )}
                  </div>
                  
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="atividade">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Atividade Recente</h3>
                    <p className="text-muted-foreground">
                      A visualização de atividades estará disponível em breve.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
