
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageSquare, CheckCircle, Clock, Building, MapPin } from 'lucide-react';
import { getInitials } from '@/utils/user';
import { Profile } from '@/types/forumTypes';
import { useNetworkConnections } from '@/hooks/community/useNetworkConnections';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MemberCardProps {
  member: Profile;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const navigate = useNavigate();
  const { 
    connectedMembers, 
    pendingRequests, 
    sendConnectionRequest, 
    processingRequest 
  } = useNetworkConnections();

  console.log('MemberCard renderizando membro:', { 
    id: member.id, 
    name: member.name,
    company: member.company_name,
    position: member.current_position 
  });

  // Verificar status da conexão
  const isConnected = connectedMembers.some(conn => conn.id === member.id);
  const isPending = pendingRequests.some(req => req.id === member.id);

  const handleConnect = async () => {
    if (isConnected || isPending || processingRequest) return;
    
    const success = await sendConnectionRequest(member.id);
    if (success) {
      toast.success('Solicitação de conexão enviada!');
    }
  };

  const handleMessage = () => {
    if (!isConnected) {
      toast.info('Você precisa estar conectado para enviar mensagens');
      return;
    }
    navigate('/comunidade/mensagens', { 
      state: { selectedMemberId: member.id } 
    });
  };

  const getConnectionButton = () => {
    if (isConnected) {
      return (
        <Button 
          size="sm" 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleMessage}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Conectado
        </Button>
      );
    }

    if (isPending) {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full" 
          disabled
        >
          <Clock className="h-4 w-4 mr-2" />
          Pendente
        </Button>
      );
    }

    return (
      <Button 
        size="sm" 
        className="w-full" 
        onClick={handleConnect}
        disabled={processingRequest}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {processingRequest ? 'Enviando...' : 'Conectar'}
      </Button>
    );
  };

  // Funções para lidar com dados vazios
  const displayName = member.name?.trim() || 'Membro da Comunidade';
  const displayPosition = member.current_position?.trim() || 'Profissional';
  const displayCompany = member.company_name?.trim();
  const displayIndustry = member.industry?.trim();
  const displayBio = member.professional_bio?.trim();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar e informações básicas */}
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage src={member.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-lg bg-primary/10">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold text-lg">{displayName}</h3>
            
            <div className="space-y-1 mt-2">
              <p className="text-sm text-muted-foreground">{displayPosition}</p>
              
              {displayCompany && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>{displayCompany}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badges e informações adicionais */}
          <div className="flex flex-wrap gap-2 justify-center">
            {displayIndustry && (
              <Badge variant="secondary" className="text-xs">
                {displayIndustry}
              </Badge>
            )}
            
            {member.available_for_networking && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                Disponível para networking
              </Badge>
            )}
            
            {/* Badge para perfis incompletos */}
            {(!displayCompany || !displayIndustry) && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                Perfil em construção
              </Badge>
            )}
          </div>

          {/* Bio profissional */}
          {displayBio ? (
            <p className="text-sm text-muted-foreground text-center line-clamp-2">
              {displayBio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/60 text-center italic">
              Biografia profissional não informada
            </p>
          )}

          {/* Botões de ação */}
          <div className="w-full space-y-2">
            {getConnectionButton()}
            
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleMessage}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar mensagem
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
