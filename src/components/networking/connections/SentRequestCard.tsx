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
      className="group"
    >
      {/* Card Premium com Glassmorphism */}
      <div className="relative">
        {/* Glow effect ao redor do card */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <Card className="relative bg-card/80 backdrop-blur-xl border border-border/30 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/5 group-hover:scale-[1.02]">
          <div className="p-6 flex items-center gap-4">
            {/* Avatar com Glow */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Avatar className="relative w-14 h-14 border-2 border-primary/20 ring-2 ring-primary/10">
                <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-base">
                  {getInitials(otherUser.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-heading font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                {otherUser.name}
              </h3>
              
              <div className="space-y-1">
                {otherUser.current_position && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
                    <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                    <span className="line-clamp-1">{otherUser.current_position}</span>
                  </div>
                )}

                {otherUser.company_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
                    <Building2 className="w-3.5 h-3.5 text-primary/60" />
                    <span className="line-clamp-1">{otherUser.company_name}</span>
                  </div>
                )}
              </div>

              {/* Status Badge Premium */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border transition-all",
                daysWaiting === 0 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                daysWaiting > 0 && daysWaiting <= 7 && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                daysWaiting > 7 && "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{statusLabel}</span>
              </div>
            </div>

            {/* Botão Cancelar Premium */}
            {onCancel && (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onCancel(connection.id)}
                  disabled={isCanceling}
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9 px-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 backdrop-blur-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{isCanceling ? 'Cancelando...' : 'Cancelar'}</span>
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
