import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConnectMessageModal } from './ConnectMessageModal';
import { StrategicMatch } from '@/hooks/useStrategicMatches';
import { 
  Sparkles, 
  Building2, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  MessageSquare,
  Clock
} from 'lucide-react';

interface DiscoverMatchCardProps {
  match: StrategicMatch;
}

export const DiscoverMatchCard = ({ match }: DiscoverMatchCardProps) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const matchedUser = match.matched_user;
  
  if (!matchedUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-viverblue border-viverblue/40 bg-viverblue/10';
    if (score >= 60) return 'text-revenue border-revenue/40 bg-revenue/10';
    return 'text-operational border-operational/40 bg-operational/10';
  };
  
  const scorePercentage = Math.round(match.compatibility_score * 100);

  return (
    <>
      <Card className="group relative aurora-glass border-aurora/20 hover:border-aurora/40 transition-all duration-300 overflow-hidden">
        {/* Aurora Glow Effect */}
        <div className="absolute inset-0 aurora-glow opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
        
        <div className="relative p-6 space-y-4">
          {/* Header: Avatar + Info + Score */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="w-16 h-16 border-2 border-aurora/20 ring-2 ring-aurora/10">
                <AvatarImage src={matchedUser.avatar_url} alt={matchedUser.name || 'User'} />
                <AvatarFallback className="bg-aurora/10 text-aurora font-semibold">
                  {getInitials(matchedUser.name || 'User')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-text-primary line-clamp-1">{matchedUser.name || 'Membro'}</h3>
                
                {matchedUser.current_position && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{matchedUser.current_position}</span>
                  </div>
                )}
                
                {matchedUser.company_name && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{matchedUser.company_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Score Badge */}
            <Badge className={`${getScoreColor(scorePercentage)} font-semibold px-3 py-1`}>
              {scorePercentage}%
            </Badge>
          </div>

          {/* Industry */}
          {matchedUser.industry && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="w-3.5 h-3.5" />
              <span>{matchedUser.industry}</span>
            </div>
          )}

          {/* Why Connect (AI Insight) */}
          <div className="space-y-2 p-4 rounded-xl bg-aurora/5 border border-aurora/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-aurora" />
              <span className="text-sm font-semibold text-aurora">Por que conectar</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {match.why_connect || 'Conexão estratégica identificada pela IA'}
            </p>
          </div>

          {/* Opportunities */}
          {match.opportunities && match.opportunities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-viverblue" />
                <span className="text-sm font-semibold text-text-primary">Oportunidades</span>
              </div>
              <ul className="space-y-1.5">
                {match.opportunities.slice(0, 3).map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="text-viverblue mt-0.5">•</span>
                    <span className="line-clamp-2">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ice Breaker Preview */}
          <div className="p-3 rounded-lg bg-surface-elevated border border-border/30">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-operational mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-operational">Sugestão de mensagem</p>
                <p className="text-sm text-text-muted line-clamp-2">{match.ice_breaker || 'Olá! Vamos conectar?'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="flex-1 aurora-gradient text-white hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conectar
            </Button>
            
            <Button 
              variant="outline"
              className="border-aurora/30 hover:bg-aurora/5"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Connect Modal */}
      <ConnectMessageModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        recipientName={matchedUser.name || 'Membro'}
        suggestedMessage={match.ice_breaker || 'Olá! Vamos conectar?'}
        recipientEmail={matchedUser.email || ''}
        recipientId={matchedUser.id}
      />
    </>
  );
};
