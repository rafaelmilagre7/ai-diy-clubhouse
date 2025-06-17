
import React from 'react';
import { ModernStatsCard } from '../ModernStatsCard';
import { Users, Activity, UserPlus, ArrowUpRight } from 'lucide-react';

interface UserStatCardsProps {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  growthRate: number;
}

export const UserStatCards: React.FC<UserStatCardsProps> = ({
  totalUsers,
  newUsersToday,
  activeUsers,
  growthRate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ModernStatsCard
        title="Total de Usuários"
        value={totalUsers}
        icon={Users}
        colorScheme="blue"
        trend={{
          value: Math.round((activeUsers / totalUsers) * 100),
          label: "usuários ativos",
          type: activeUsers > totalUsers * 0.3 ? 'positive' : 'neutral'
        }}
      />
      
      <ModernStatsCard
        title="Novos Usuários Hoje"
        value={newUsersToday}
        icon={UserPlus}
        colorScheme="green"
        trend={{
          value: newUsersToday,
          label: "hoje",
          type: newUsersToday > 0 ? 'positive' : 'neutral'
        }}
      />
      
      <ModernStatsCard
        title="Usuários Ativos (7d)"
        value={activeUsers}
        icon={Activity}
        colorScheme="purple"
        trend={{
          value: Math.round((activeUsers / totalUsers) * 100),
          label: "do total",
          type: activeUsers > totalUsers * 0.2 ? 'positive' : 'negative'
        }}
      />
      
      <ModernStatsCard
        title="Taxa de Crescimento"
        value={`${growthRate.toFixed(1)}%`}
        icon={ArrowUpRight}
        colorScheme={growthRate > 0 ? "green" : growthRate < 0 ? "red" : "indigo"}
        trend={{
          value: Math.abs(growthRate),
          label: "vs período anterior",
          type: growthRate > 0 ? 'positive' : growthRate < 0 ? 'negative' : 'neutral'
        }}
      />
    </div>
  );
};
