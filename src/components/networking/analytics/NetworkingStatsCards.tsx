import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { NetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';
import { motion } from 'framer-motion';

interface NetworkingStatsCardsProps {
  analytics: NetworkingAnalytics;
}

export const NetworkingStatsCards: React.FC<NetworkingStatsCardsProps> = ({ analytics }) => {
  const stats = [
    {
      title: 'Total de Conexões',
      value: analytics.totalConnections,
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-500',
      trend: '+12%'
    },
    {
      title: 'Conversas Ativas',
      value: analytics.activeConversations,
      icon: MessageSquare,
      color: 'from-green-500/20 to-green-600/10',
      iconColor: 'text-green-500',
      trend: '+8%'
    },
    {
      title: 'Matches Este Mês',
      value: analytics.matchesThisMonth,
      icon: Target,
      color: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-500',
      trend: '+24%'
    },
    {
      title: 'Taxa de Resposta',
      value: `${analytics.responseRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500/20 to-orange-600/10',
      iconColor: 'text-orange-500',
      trend: '+5%'
    },
    {
      title: 'Tempo Médio Resposta',
      value: analytics.averageResponseTime,
      icon: Clock,
      color: 'from-cyan-500/20 to-cyan-600/10',
      iconColor: 'text-cyan-500',
      trend: '-15%'
    },
    {
      title: 'Valor Estimado',
      value: `R$ ${(analytics.estimatedValue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-500',
      trend: '+32%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} border border-border/30`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-600 border border-green-500/30">
                    {stat.trend}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
