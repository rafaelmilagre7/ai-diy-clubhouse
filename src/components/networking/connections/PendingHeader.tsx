import { motion } from 'framer-motion';
import { Clock, Inbox, AlertCircle } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Badge } from '@/components/ui/badge';

interface PendingHeaderProps {
  receivedCount: number;
  unreadCount: number;
  isLoading?: boolean;
}

export const PendingHeader = ({ 
  receivedCount,
  unreadCount,
  isLoading 
}: PendingHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-operational/10 via-surface-elevated to-warning/5 border border-operational/20 p-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(250,189,0,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-operational/20 border border-operational/30">
              <Clock className="w-6 h-6 text-operational" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Solicitações Recebidas
                </h2>
                {unreadCount > 0 && (
                  <Badge className="bg-operational/20 text-operational border-operational/40 animate-pulse">
                    {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Profissionais que querem se conectar com você
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            icon={Inbox}
            label="Total de Solicitações"
            value={receivedCount}
            isLoading={isLoading}
            variant="primary"
          />
          
          <StatsCard
            icon={AlertCircle}
            label="Aguardando Resposta"
            value={unreadCount}
            isLoading={isLoading}
            variant="warning"
          />
        </div>
      </div>
    </motion.div>
  );
};
