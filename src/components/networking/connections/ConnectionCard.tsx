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
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';

interface ConnectionCardProps {
  connection: Connection;
  variant: 'active' | 'pending';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMessage?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export const ConnectionCard = ({ 
  connection, 
  variant,
  onAccept,
  onReject,
  onMessage,
  isAccepting,
  isRejecting
}: ConnectionCardProps) => {
  const { user } = useAuth();
  
  // Determinar qual perfil mostrar (o outro usuário da conexão)
  const isRequester = connection.requester_id === user?.id;
  const otherUser = isRequester ? connection.recipient : connection.requester;

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
    <Card className="aurora-glass border-aurora/20 hover:border-aurora/40 transition-all duration-300 overflow-hidden group">
      <div className="p-6 space-y-4">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-aurora/20 ring-2 ring-aurora/10">
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />
            <AvatarFallback className="bg-aurora/10 text-aurora font-semibold">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-text-primary">{otherUser.name}</h3>
              {variant === 'active' && (
                <Badge className="bg-viverblue/20 text-viverblue border-viverblue/40">
                  Conectado
                </Badge>
              )}
            </div>

            {otherUser.current_position && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{otherUser.current_position}</span>
              </div>
            )}

            {otherUser.company_name && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Building2 className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{otherUser.company_name}</span>
              </div>
            )}

            {otherUser.industry && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <MapPin className="w-3.5 h-3.5" />
                <span>{otherUser.industry}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-text-muted pt-2 border-t border-border/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {variant === 'pending' 
              ? `Solicitação recebida ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: ptBR })}`
              : `Conectado ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: ptBR })}`
            }
          </span>
        </div>

        {/* Actions */}
        {variant === 'pending' && onAccept && onReject && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onAccept(connection.id)}
              disabled={isAccepting || isRejecting}
              className="flex-1 bg-viverblue/20 text-viverblue border border-viverblue/40 hover:bg-viverblue/30"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isAccepting ? 'Aceitando...' : 'Aceitar'}
            </Button>
            
            <Button
              onClick={() => onReject(connection.id)}
              disabled={isAccepting || isRejecting}
              variant="outline"
              className="flex-1 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isRejecting ? 'Recusando...' : 'Recusar'}
            </Button>
          </div>
        )}

        {variant === 'active' && onMessage && (
          <div className="flex gap-3 pt-2">
            <Link to={`/perfil/${otherUser.id}`} className="flex-1">
              <Button 
                variant="outline"
                className="w-full border-aurora/30 hover:bg-aurora/5"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Perfil
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="flex-1 border-viverblue/30 hover:bg-viverblue/5"
              onClick={onMessage}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagem
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
