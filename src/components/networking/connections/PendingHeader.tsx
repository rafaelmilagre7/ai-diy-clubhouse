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
      className="relative overflow-hidden rounded-2xl border border-aurora/20 bg-gradient-to-br from-aurora/10 via-surface-elevated to-operational/5 p-8 mb-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
      
      <div className="relative space-y-6">
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-operational/20 border border-operational/30">
            <Inbox className="h-6 w-6 text-operational" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Solicitações Recebidas
            </h2>
            <p className="text-sm text-text-muted">
              Responda às solicitações de conexão e expanda sua rede
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            icon={Inbox}
            label="Total Acumulado"
            value={receivedCount}
            variant="primary"
            isLoading={isLoading}
          />
          
          <StatsCard
            icon={Clock}
            label="Novas Hoje"
            value={unreadCount}
            variant="warning"
            isLoading={isLoading}
          />

          <div className="text-center p-4 rounded-xl bg-aurora-primary/10 border border-aurora-primary/20">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-aurora-primary/20 mb-2">
              <Clock className="w-4 h-4 text-aurora-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">2h</p>
            <p className="text-xs text-muted-foreground">Tempo Médio de Resposta</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
