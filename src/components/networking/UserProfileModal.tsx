
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, 
  MapPin, 
  Star, 
  MessageSquare, 
  UserPlus, 
  Mail,
  Phone,
  LinkedinIcon,
  TrendingUp,
  Target,
  Lightbulb
} from 'lucide-react';
import { NetworkMatch } from '@/hooks/networking/useNetworkMatches';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  match: NetworkMatch;
  onConnect: () => void;
  onDismiss: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  match,
  onConnect,
  onDismiss
}) => {
  const user = match.matched_user;
  
  const compatibilityColor = 
    match.compatibility_score >= 80 ? 'text-green-500' :
    match.compatibility_score >= 60 ? 'text-yellow-500' : 'text-red-500';

  const showContactInfo = match.status === 'contacted';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback>
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.name || 'Usuário'}</h2>
              <p className="text-muted-foreground">{user?.current_position}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score de Compatibilidade */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className={`h-5 w-5 ${compatibilityColor}`} />
                  <span className="font-medium">Compatibilidade</span>
                </div>
                <Badge variant="outline" className={`${compatibilityColor} border-current`}>
                  {match.compatibility_score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {match.match_reason}
              </p>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          {user?.company_name && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{user.company_name}</p>
                  {user.current_position && (
                    <p className="text-sm text-muted-foreground">
                      Cargo: {user.current_position}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de IA */}
          {match.ai_analysis && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Análise de IA
                </h3>
                
                {match.ai_analysis.strengths && match.ai_analysis.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Pontos Fortes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.ai_analysis.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {match.ai_analysis.opportunities && match.ai_analysis.opportunities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Oportunidades:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.ai_analysis.opportunities.map((opportunity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {opportunity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {match.ai_analysis.recommended_approach && (
                  <div>
                    <p className="text-sm font-medium mb-2">Abordagem Recomendada:</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {match.ai_analysis.recommended_approach}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações de Contato */}
          {showContactInfo && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Informações de Contato
                </h3>
                <div className="space-y-2">
                  {user?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${user.email}`} className="text-viverblue hover:underline">
                        {user.email}
                      </a>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    * Informações de contato disponíveis após conexão
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            {match.status === 'pending' || match.status === 'viewed' ? (
              <>
                <Button onClick={onConnect} className="flex-1 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Conectar
                </Button>
                <Button variant="outline" onClick={onDismiss} className="flex-1">
                  Dispensar
                </Button>
              </>
            ) : match.status === 'contacted' ? (
              <Button disabled className="flex-1">
                Solicitação Enviada
              </Button>
            ) : (
              <Button variant="secondary" onClick={onDismiss} className="flex-1">
                Match Dispensado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
