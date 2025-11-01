import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Connection } from '@/hooks/networking/useConnections';
import { 
  Building2, 
  Briefcase, 
  MapPin,
  Eye,
  Clock,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';
import { useMutualConnections } from '@/hooks/networking/useMutualConnections';
import { useConnectionsCount } from '@/hooks/networking/usePublicProfile';
import { OnlineIndicator } from '../chat/OnlineIndicator';
import { connectionDesignTokens as tokens } from '@/styles/connection-design-tokens';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface SentRequestCardProps {
  connection: Connection;
  onCancel?: (id: string) => void;
  isCanceling?: boolean;
}

export const SentRequestCard = ({ 
  connection, 
  onCancel,
  isCanceling
}: SentRequestCardProps) => {
  const { user } = useAuth();
  
  const isRequester = connection.requester_id === user?.id;
  const otherUser = isRequester ? connection.recipient : connection.requester;

  const { data: mutualConnections } = useMutualConnections(otherUser?.id);
  const { data: connectionsCount = 0 } = useConnectionsCount(otherUser?.id);

  if (!otherUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calcular status temporal
  const createdAt = new Date(connection.created_at);
  const hoursSince = differenceInHours(new Date(), createdAt);
  const daysSince = differenceInDays(new Date(), createdAt);
  
  const getTemporalStatus = () => {
    if (hoursSince < 24) {
      return {
        label: `Enviada há ${hoursSince}h`,
        variant: tokens.status.temporal.recent,
        progress: (hoursSince / 24) * 100,
        canCancel: false,
      };
    } else if (daysSince <= 7) {
      return {
        label: `Aguardando há ${daysSince}d`,
        variant: tokens.status.temporal.waiting,
        progress: (daysSince / 7) * 100,
        canCancel: daysSince >= 2,
      };
    } else {
      return {
        label: `Sem resposta há ${daysSince}d`,
        variant: tokens.status.temporal.overdue,
        progress: 100,
        canCancel: true,
      };
    }
  };

  const temporalStatus = getTemporalStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        tokens.card.bg,
        tokens.card.border,
        tokens.card.transition,
        tokens.card.radius,
        "overflow-hidden group hover:shadow-lg"
      )}>
        <div className={cn(tokens.card.padding, "space-y-4")}>
          {/* Header: Avatar + Info */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-aurora/20 ring-2 ring-aurora/10">
                <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />
                <AvatarFallback className="bg-aurora/10 text-aurora font-semibold text-sm">
                  {getInitials(otherUser.name)}
                </AvatarFallback>
              </Avatar>
              <OnlineIndicator userId={otherUser.id} className="w-2.5 h-2.5" />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-text-primary text-sm line-clamp-1">
                  {otherUser.name}
                </h3>
                <Badge className={cn(temporalStatus.variant, "text-xs whitespace-nowrap")}>
                  {temporalStatus.label}
                </Badge>
              </div>

              {otherUser.current_position && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.current_position}</span>
                </div>
              )}

              {otherUser.company_name && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.company_name}</span>
                </div>
              )}

              {otherUser.industry && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.industry}</span>
                </div>
              )}

              {/* Conexões */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  <span>{connectionsCount} {connectionsCount === 1 ? 'conexão' : 'conexões'}</span>
                </div>
                
                {mutualConnections && mutualConnections.count > 0 && (
                  <div className="flex items-center gap-1 text-xs text-aurora">
                    <Users className="w-3 h-3" aria-hidden="true" />
                    <span>{mutualConnections.count} em comum</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Progresso Temporal */}
          <div className="space-y-2 pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3 h-3" />
                Tempo de espera
              </span>
              <span className="text-muted-foreground">
                {Math.round(temporalStatus.progress)}%
              </span>
            </div>
            <Progress 
              value={temporalStatus.progress} 
              className="h-1.5"
            />
            {temporalStatus.progress >= 70 && (
              <p className="flex items-center gap-1.5 text-xs text-operational">
                <AlertCircle className="w-3 h-3" />
                Solicitação pode estar aguardando resposta há muito tempo
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-text-muted">
            Enviada {formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to={`/perfil/${otherUser.id}`} className="flex-1">
              <Button 
                variant="outline"
                size="sm"
                className="w-full gap-1.5 hover:bg-aurora/10 hover:border-aurora/30 hover:text-aurora transition-all"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs">Ver Perfil</span>
              </Button>
            </Link>
            
            {temporalStatus.canCancel && onCancel && (
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  onClick={() => onCancel(connection.id)}
                  disabled={isCanceling}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full gap-1.5",
                    tokens.button.danger
                  )}
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">{isCanceling ? 'Cancelando...' : 'Cancelar'}</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
