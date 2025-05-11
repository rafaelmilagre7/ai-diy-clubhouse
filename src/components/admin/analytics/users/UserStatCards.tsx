
import React from 'react';
import { StatCard } from '@/components/admin/dashboard/StatCard';
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Usuários"
        value={totalUsers}
        icon={<Users className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Novos Usuários Hoje"
        value={newUsersToday}
        icon={<UserPlus className="h-5 w-5" />}
        percentageChange={newUsersToday > 0 ? 100 : 0}
        percentageText="em relação a ontem"
        colorScheme="green"
      />
      
      <StatCard
        title="Usuários Ativos (7d)"
        value={activeUsers}
        icon={<Activity className="h-5 w-5" />}
        percentageChange={Math.round((activeUsers / totalUsers) * 100)}
        percentageText="do total de usuários"
        colorScheme="blue"
      />
      
      <StatCard
        title="Taxa de Crescimento"
        value={`${growthRate.toFixed(1)}%`}
        icon={<ArrowUpRight className="h-5 w-5" />}
        colorScheme="green"
      />
    </div>
  );
};
