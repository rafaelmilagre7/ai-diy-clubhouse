
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  Target,
  Lightbulb,
  TrendingUp,
  Users
} from 'lucide-react';
import { NetworkMatch } from '@/hooks/networking/useNetworkMatches';

interface UserProfileModalProps {
  match: NetworkMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (matchId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  match,
  isOpen,
  onClose,
  onContact
}) => {
  if (!match?.matched_user) return null;

  const { matched_user, ai_analysis, match_strengths, suggested_topics, compatibility_score } = match;

  const handleContact = () => {
    onContact(match.id);
    onClose();
  };

  const handleWhatsApp = () => {
    if (matched_user.whatsapp_number) {
      const message = encodeURIComponent(`Olá! Vi seu perfil através do Viver de IA e gostaria de trocar uma ideia sobre possíveis oportunidades de colaboração.`);
      window.open(`https://wa.me/${matched_user.whatsapp_number}?text=${message}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={matched_user.avatar_url || ''} />
              <AvatarFallback className="bg-viverblue text-white">
                {matched_user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{matched_user.name}</h3>
              <p className="text-muted-foreground">{matched_user.current_position}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score de Compatibilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-viverblue" />
                Score de Compatibilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-viverblue">
                  {Math.round(compatibility_score * 100)}%
                </div>
                <div className="flex-1">
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-viverblue h-2 rounded-full transition-all"
                      style={{ width: `${compatibility_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {matched_user.company_name && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{matched_user.company_name}</span>
                </div>
              )}
              {matched_user.current_position && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{matched_user.current_position}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pontos Fortes do Match */}
          {match_strengths && match_strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Pontos Fortes da Compatibilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {match_strengths.map((strength, index) => (
                    <div key={index} className="border-l-2 border-green-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{strength.factor}</span>
                        <Badge variant="secondary">{Math.round(strength.strength * 100)}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{strength.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise da IA */}
          {ai_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Insights da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pontos Fortes da IA */}
                {ai_analysis.strengths && ai_analysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Pontos Fortes</h4>
                    <ul className="space-y-1">
                      {ai_analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Oportunidades */}
                {ai_analysis.opportunities && ai_analysis.opportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-viverblue">Oportunidades Identificadas</h4>
                    <ul className="space-y-1">
                      {ai_analysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-viverblue mt-1">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Abordagem Recomendada */}
                {ai_analysis.recommendedApproach && (
                  <div>
                    <h4 className="font-medium mb-2 text-purple-600">Abordagem Recomendada</h4>
                    <p className="text-sm bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                      {ai_analysis.recommendedApproach}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tópicos Sugeridos */}
          {suggested_topics && suggested_topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Tópicos para Conversa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggested_topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            <Button onClick={handleContact} className="flex-1 bg-viverblue hover:bg-viverblue/90">
              <MessageSquare className="h-4 w-4 mr-2" />
              Marcar como Contatado
            </Button>
            
            {matched_user.whatsapp_number && (
              <Button onClick={handleWhatsApp} variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
