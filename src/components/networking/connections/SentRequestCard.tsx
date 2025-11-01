import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Connection } from '@/hooks/networking/useConnections';
import { 
  Building2, 
  Briefcase, 
  Clock,
  XCircle
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  if (!otherUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calcular dias aguardando
  const daysWaiting = differenceInDays(new Date(), new Date(connection.created_at));
  
  let statusLabel = '';
  let statusColor = 'text-muted-foreground';
  
  if (daysWaiting === 0) {
    statusLabel = 'Enviada hoje';
    statusColor = 'text-system-healthy';
  } else if (daysWaiting <= 7) {
    statusLabel = `Aguardando há ${daysWaiting} ${daysWaiting === 1 ? 'dia' : 'dias'}`;
    statusColor = 'text-operational';
  } else {
    statusLabel = `Sem resposta há ${daysWaiting} dias`;
    statusColor = 'text-destructive';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="bg-surface-elevated/50 border border-border/50 hover:border-aurora/30 transition-all shadow-sm hover:shadow-md">
        <div className="p-5 flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 border-2 border-aurora/10">
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />
            <AvatarFallback className="bg-aurora/10 text-aurora font-semibold text-sm">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">
              {otherUser.name}
            </h3>
            
            {otherUser.current_position && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span className="line-clamp-1">{otherUser.current_position}</span>
              </div>
            )}

            {otherUser.company_name && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span className="line-clamp-1">{otherUser.company_name}</span>
              </div>
            )}

            {/* Status */}
            <div className={cn("flex items-center gap-1.5 text-xs", statusColor)}>
              <Clock className="w-3 h-3" />
              <span>{statusLabel}</span>
            </div>
          </div>

          {/* Action */}
          {onCancel && (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onCancel(connection.id)}
                disabled={isCanceling}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-4 h-4" />
                <span className="text-xs">{isCanceling ? 'Cancelando...' : 'Cancelar'}</span>
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
