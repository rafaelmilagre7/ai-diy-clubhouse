
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building, 
  Star, 
  UserPlus, 
  Eye,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { NetworkMatch } from '@/hooks/networking/useNetworkMatches';
import { UserProfileModal } from './UserProfileModal';
import { useUpdateMatchStatus } from '@/hooks/networking/useNetworkMatches';
import { useCreateConnection } from '@/hooks/networking/useNetworkConnections';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface NetworkMatchCardProps {
  match: NetworkMatch;
  matchType: 'customer' | 'supplier';
}

export const NetworkMatchCard: React.FC<NetworkMatchCardProps> = ({
  match,
  matchType
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const updateMatchStatus = useUpdateMatchStatus();
  const createConnection = useCreateConnection();
  const queryClient = useQueryClient();

  const handleViewProfile = async () => {
    if (!match.is_viewed) {
      try {
        await updateMatchStatus(match.id, 'viewed');
        // Invalidar queries para atualizar o estado
        queryClient.invalidateQueries({ queryKey: ['network-matches'] });
      } catch (error) {
        console.error('Erro ao marcar como visualizado:', error);
      }
    }
    setShowProfileModal(true);
  };

  const handleConnect = async () => {
    try {
      await createConnection.mutateAsync(match.matched_user_id);
      await updateMatchStatus(match.id, 'contacted');
      queryClient.invalidateQueries({ queryKey: ['network-matches'] });
      toast.success('Solicitação de conexão enviada!');
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const handleDismiss = async () => {
    try {
      await updateMatchStatus(match.id, 'dismissed');
      queryClient.invalidateQueries({ queryKey: ['network-matches'] });
      toast.success('Match dispensado');
    } catch (error) {
      console.error('Erro ao dispensar match:', error);
      toast.error('Erro ao dispensar match. Tente novamente.');
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { label: 'Novo', variant: 'default' as const },
      viewed: { label: 'Visualizado', variant: 'secondary' as const },
      contacted: { label: 'Contatado', variant: 'outline' as const },
      dismissed: { label: 'Dispensado', variant: 'destructive' as const }
    };

    const config = statusConfig[match.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const compatibilityColor = 
    match.compatibility_score >= 80 ? 'text-green-500' :
    match.compatibility_score >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      <Card className={`transition-all hover:shadow-lg ${!match.is_viewed ? 'ring-2 ring-viverblue/20' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.matched_user?.avatar_url} />
                <AvatarFallback>
                  {match.matched_user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-none">
                  {match.matched_user?.name || 'Usuário'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {match.matched_user?.current_position || 'Posição não informada'}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {!match.is_viewed && (
            <div className="flex items-center gap-1 text-xs text-viverblue">
              <Sparkles className="h-3 w-3" />
              Novo match!
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {match.matched_user?.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{match.matched_user.company_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Star className={`h-4 w-4 ${compatibilityColor}`} />
              <span className={`font-medium ${compatibilityColor}`}>
                {match.compatibility_score}% de compatibilidade
              </span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Motivo do match:</p>
            <p className="text-sm">{match.match_reason}</p>
          </div>

          {match.ai_analysis?.strengths && match.ai_analysis.strengths.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Pontos fortes:
              </p>
              <div className="flex flex-wrap gap-1">
                {match.ai_analysis.strengths.slice(0, 2).map((strength, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewProfile}
              className="flex-1 gap-1"
            >
              <Eye className="h-3 w-3" />
              Ver Perfil
            </Button>
            
            {match.status === 'pending' || match.status === 'viewed' ? (
              <Button 
                size="sm" 
                onClick={handleConnect}
                disabled={createConnection.isPending}
                className="flex-1 gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Conectar
              </Button>
            ) : match.status === 'contacted' ? (
              <Button 
                variant="secondary" 
                size="sm" 
                disabled
                className="flex-1 gap-1"
              >
                Conectado
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleDismiss}
                className="flex-1 gap-1"
              >
                Dispensar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showProfileModal && (
        <UserProfileModal
          userId={match.matched_user_id}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          match={match}
          onConnect={handleConnect}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
};
