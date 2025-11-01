import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface ActiveConnectionsHeaderProps {
  totalConnections: number;
  isLoading?: boolean;
}

export const ActiveConnectionsHeader = ({ 
  totalConnections,
  isLoading 
}: ActiveConnectionsHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-aurora/10 via-surface-elevated to-aurora-primary/10 border border-aurora/20 p-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-aurora/20 border border-aurora/30">
              <Users className="w-6 h-6 text-aurora" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Minhas Conexões
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Conectado com profissionais que compartilham seus interesses
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            icon={Users}
            label="Total de Conexões"
            value={totalConnections}
            isLoading={isLoading}
            variant="primary"
          />
          
          <StatsCard
            icon={TrendingUp}
            label="Esta Semana"
            value={Math.floor(totalConnections * 0.15)} // Mock: 15% das conexões
            trend={12}
            isLoading={isLoading}
            variant="success"
          />
          
          <StatsCard
            icon={Calendar}
            label="Este Mês"
            value={Math.floor(totalConnections * 0.4)} // Mock: 40% das conexões
            isLoading={isLoading}
            variant="info"
          />
        </div>
      </div>
    </motion.div>
  );
};
