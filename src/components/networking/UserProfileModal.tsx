
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
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Star, 
  UserPlus, 
  Globe,
  TrendingUp,
  Mail,
  Linkedin,
  ExternalLink
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
  isOpen,
  onClose,
  match,
  onConnect,
  onDismiss
}) => {
  const compatibilityColor = 
    match.compatibility_score >= 80 ? 'text-green-500' :
    match.compatibility_score >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={match.matched_user?.avatar_url} />
              <AvatarFallback className="text-lg">
                {match.matched_user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{match.matched_user?.name || 'Usuário'}</h2>
              <p className="text-muted-foreground">{match.matched_user?.current_position || 'Posição não informada'}</p>
              
              {match.matched_user?.company_name && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{match.matched_user.company_name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Star className={`h-4 w-4 ${compatibilityColor}`} />
                <span className={`font-medium ${compatibilityColor}`}>
                  {match.compatibility_score}% de compatibilidade
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informações de Contato
            </h3>
            
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{match.matched_user?.email || 'Não informado'}</p>
                </div>
                {match.matched_user?.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${match.matched_user.email}`} className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Enviar Email
                    </a>
                  </Button>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">LinkedIn</p>
                  <p className="text-sm text-muted-foreground">
                    {match.matched_user?.linkedin_url || 'Não informado'}
                  </p>
                </div>
                {match.matched_user?.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={match.matched_user.linkedin_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Ver Perfil
                    </a>
                  </Button>
                )}
              </div>

              {/* Company Website */}
              {match.matched_user?.company_name && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Website da Empresa</p>
                    <p className="text-sm text-muted-foreground">
                      {match.matched_user.company_website || 'Não informado'}
                    </p>
                  </div>
                  {match.matched_user.company_website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={match.matched_user.company_website} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Visitar
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Match Analysis */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise do Match
            </h3>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Motivo do match:</p>
              <p className="text-sm">{match.match_reason}</p>
            </div>

            {match.ai_analysis?.strengths && match.ai_analysis.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Pontos fortes identificados:</p>
                <div className="flex flex-wrap gap-2">
                  {match.ai_analysis.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {match.ai_analysis?.opportunities && match.ai_analysis.opportunities.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Oportunidades identificadas:</p>
                <div className="flex flex-wrap gap-2">
                  {match.ai_analysis.opportunities.map((opportunity, index) => (
                    <Badge key={index} variant="outline">
                      {opportunity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {match.ai_analysis?.recommended_approach && (
              <div>
                <p className="text-sm font-medium mb-2">Abordagem recomendada:</p>
                <p className="text-sm bg-viverblue/5 p-3 rounded border-l-2 border-viverblue">
                  {match.ai_analysis.recommended_approach}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              <div className="flex-1 text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Solicitação de conexão enviada
                </p>
              </div>
            ) : (
              <div className="flex-1 text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Match dispensado
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
