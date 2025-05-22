
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, Building2, Calendar, ChevronLeft, Globe, Linkedin, Mail, MapPin, User2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/forumTypes';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/utils/user';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MemberDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { pendingRequests, connectedMembers, sendConnectionRequest, processingRequest } = useNetworkConnections();

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', memberId)
          .single();
          
        if (error) throw error;
        setMember(data as Profile);
      } catch (error) {
        console.error('Erro ao buscar dados do membro:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMember();
  }, [memberId]);
  
  // Verificar se o usuário já está conectado ou enviou solicitação
  const isPending = memberId && pendingRequests.some(req => req.id === memberId);
  const isConnected = memberId && connectedMembers.some(conn => conn.id === memberId);
  
  const handleConnectRequest = async () => {
    if (!memberId) return;
    await sendConnectionRequest(memberId);
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link to="/comunidade" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span>Voltar para a Comunidade</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link to="/comunidade" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span>Voltar para a Comunidade</span>
          </Link>
        </div>
        
        <Card>
          <CardContent className="py-10 text-center">
            <User2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Membro não encontrado</h2>
            <p className="text-muted-foreground">O membro que você está procurando não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Formatar data (se estiver disponível)
  const memberSince = member.created_at 
    ? format(new Date(member.created_at), "'Membro desde' MMMM 'de' yyyy", { locale: ptBR })
    : 'Membro da comunidade';

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link to="/comunidade" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span>Voltar para a Comunidade</span>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <p className="text-muted-foreground">{member.current_position || 'Membro'}</p>
                <p className="text-sm text-muted-foreground mt-1">{memberSince}</p>
              </div>
            </div>
            
            {/* Botão de conexão */}
            {!isConnected && !isPending && (
              <Button 
                onClick={handleConnectRequest} 
                disabled={processingRequest}
                className="whitespace-nowrap"
              >
                {processingRequest ? 'Enviando...' : 'Conectar'}
              </Button>
            )}
            {isPending && (
              <Button 
                variant="outline" 
                disabled 
                className="whitespace-nowrap"
              >
                Solicitação Enviada
              </Button>
            )}
            {isConnected && (
              <Button 
                variant="secondary"
                className="whitespace-nowrap"
              >
                Conectado
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {member.professional_bio && (
            <div>
              <h3 className="font-semibold mb-2">Sobre</h3>
              <p className="text-muted-foreground">{member.professional_bio}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {member.company_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{member.company_name}</span>
              </div>
            )}
            
            {member.current_position && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{member.current_position}</span>
              </div>
            )}
            
            {member.industry && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{member.industry}</span>
              </div>
            )}
            
            {member.linkedin_url && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={member.linkedin_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Perfil no LinkedIn
                </a>
              </div>
            )}
          </div>
          
          {member.skills && member.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberDetail;
