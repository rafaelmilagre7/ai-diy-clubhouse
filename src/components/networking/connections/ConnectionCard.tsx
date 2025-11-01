import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Connection } from '@/hooks/networking/useConnections';
import { 
  Building2, 
  Briefcase, 
  MapPin, 
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  UserPlus,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';
import { useMutualConnections } from '@/hooks/networking/useMutualConnections';
import { useConnectionsCount } from '@/hooks/networking/usePublicProfile';
import { OnlineIndicator } from '../chat/OnlineIndicator';
import { connectionTokens as tokens } from '@/styles/connection-tokens';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ConnectionCardProps {
  connection: Connection;
  variant: 'active' | 'pending' | 'discover';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMessage?: () => void;
  onConnect?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isConnecting?: boolean;
  showPendingBadge?: boolean;
}

export const ConnectionCard = ({ 
  connection, 
  variant,
  onAccept,
  onReject,
  onMessage,
  onConnect,
  isAccepting,
  isRejecting,
  isConnecting,
  showPendingBadge
}: ConnectionCardProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        tokens.colors.cardBg,
        tokens.colors.cardBorder,
        tokens.transitions.default,
        "overflow-hidden group hover:shadow-lg"
      )}>
        <div className={cn(tokens.spacing.cardPadding, tokens.spacing.contentSpace)}>
          {/* Header: Avatar + Info */}
          <div className={cn("flex items-start", tokens.spacing.cardGap)}>
            <div className="relative">
              <Avatar className={cn(
                tokens.sizes.avatarMd,
                "border-2 border-aurora/20 ring-2 ring-aurora/10"
              )}>
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
                {variant === 'active' && (
                  <Badge className={cn(tokens.colors.badgeConnected, "text-xs")}>
                    Conectado
                  </Badge>
                )}
                {showPendingBadge && (
                  <Badge className={cn(tokens.colors.badgePending, "text-xs animate-pulse")}>
                    Enviada
                  </Badge>
                )}
              </div>

              {otherUser.current_position && (
                <div className={cn("flex items-center gap-1.5 text-xs text-text-muted")}>
                  <Briefcase className={tokens.sizes.iconSm} aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.current_position}</span>
                </div>
              )}

              {otherUser.company_name && (
                <div className={cn("flex items-center gap-1.5 text-xs text-text-muted")}>
                  <Building2 className={tokens.sizes.iconSm} aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.company_name}</span>
                </div>
              )}

              {otherUser.industry && (
                <div className={cn("flex items-center gap-1.5 text-xs text-text-muted")}>
                  <MapPin className={tokens.sizes.iconSm} aria-hidden="true" />
                  <span className="line-clamp-1">{otherUser.industry}</span>
                </div>
              )}

              {/* Conexões e Conexões Mútuas */}
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

          {/* Timestamp */}
          {variant !== 'discover' && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted pt-2 border-t border-border/30">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <span>
                {variant === 'pending' 
                  ? `Solicitação recebida ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: ptBR })}`
                  : `Conectado ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: ptBR })}`
                }
              </span>
            </div>
          )}

          {/* Actions */}
          {variant === 'pending' && onAccept && onReject && (
            <div className="flex items-center gap-2 pt-2">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  onClick={() => onAccept(connection.id)}
                  disabled={isAccepting || isRejecting}
                  size="sm"
                  className="w-full gap-1.5 bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/40 hover:bg-aurora-primary/30 focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
                  aria-label="Aceitar solicitação de conexão"
                >
                  <CheckCircle2 className={tokens.sizes.iconSm} />
                  <span className="text-xs">{isAccepting ? 'Aceitando...' : 'Aceitar'}</span>
                </Button>
              </motion.div>
              
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  onClick={() => onReject(connection.id)}
                  disabled={isAccepting || isRejecting}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  aria-label="Recusar solicitação de conexão"
                >
                  <XCircle className={tokens.sizes.iconSm} />
                  <span className="text-xs">{isRejecting ? 'Recusando...' : 'Recusar'}</span>
                </Button>
              </motion.div>
            </div>
          )}

          {variant === 'active' && onMessage && (
            <div className="flex gap-2 pt-2">
              <Link to={`/perfil/${otherUser.id}`} className="flex-1">
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 hover:bg-aurora/10 hover:border-aurora/30 hover:text-aurora transition-all focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
                  aria-label="Ver perfil"
                >
                  <Eye className={tokens.sizes.iconSm} />
                  <span className="text-xs">Perfil</span>
                </Button>
              </Link>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button 
                  size="sm"
                  className="w-full gap-1.5 bg-gradient-to-r from-aurora to-aurora-primary hover:from-aurora/90 hover:to-aurora-primary/90 text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border-0 focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
                  onClick={onMessage}
                  aria-label="Enviar mensagem"
                >
                  <MessageSquare className={tokens.sizes.iconSm} />
                  <span className="text-xs">Mensagem</span>
                </Button>
              </motion.div>
            </div>
          )}

          {variant === 'discover' && onConnect && (
            <div className="flex gap-2 pt-2">
              <Link to={`/perfil/${otherUser.id}`} className="flex-1">
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 hover:bg-aurora/10 hover:border-aurora/30 hover:text-aurora transition-all focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
                  aria-label="Ver perfil"
                >
                  <Eye className={tokens.sizes.iconSm} />
                  <span className="text-xs">Perfil</span>
                </Button>
              </Link>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button 
                  size="sm"
                  className="w-full gap-1.5 bg-gradient-to-r from-aurora to-aurora-primary hover:from-aurora/90 hover:to-aurora-primary/90 text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border-0 focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
                  onClick={onConnect}
                  disabled={isConnecting || showPendingBadge}
                  aria-label="Conectar"
                >
                  <UserPlus className={tokens.sizes.iconSm} />
                  <span className="text-xs">
                    {showPendingBadge ? 'Enviada' : isConnecting ? 'Conectando...' : 'Conectar'}
                  </span>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
