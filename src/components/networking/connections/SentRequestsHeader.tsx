import { motion } from 'framer-motion';
import { Send, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface SentRequestsHeaderProps {
  totalSent: number;
  pendingCount: number;
  acceptanceRate?: number;
  isLoading?: boolean;
}

export const SentRequestsHeader = ({ 
  totalSent,
  pendingCount,
  acceptanceRate = 0,
  isLoading 
}: SentRequestsHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-info/10 via-surface-elevated to-aurora/5 border border-info/20 p-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/20 border border-info/30">
              <Send className="w-6 h-6 text-info" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Solicitações Enviadas
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Acompanhe suas solicitações de conexão pendentes
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            icon={Send}
            label="Total Enviadas"
            value={totalSent}
            isLoading={isLoading}
            variant="info"
          />
          
          <StatsCard
            icon={Clock}
            label="Aguardando Resposta"
            value={pendingCount}
            isLoading={isLoading}
            variant="warning"
          />
          
          <StatsCard
            icon={acceptanceRate >= 50 ? CheckCircle2 : TrendingUp}
            label="Taxa de Aceitação"
            value={Math.round(acceptanceRate)}
            trend={acceptanceRate >= 50 ? 5 : -2}
            isLoading={isLoading}
            variant={acceptanceRate >= 50 ? 'success' : 'primary'}
          />
        </div>
      </div>
    </motion.div>
  );
};
