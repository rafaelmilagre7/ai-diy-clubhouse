
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/useDashboardData';
import LoadingScreen from '@/components/common/LoadingScreen';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DashboardActivity } from '@/components/dashboard/DashboardActivity';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader 
        userName={profile?.name || user?.email || 'Usuário'}
        completedSolutions={data?.completedSolutions || 0}
        totalSolutions={data?.totalSolutions || 0}
      />
      
      <StatsCards 
        totalSolutions={data?.totalSolutions || 0}
        completedSolutions={data?.completedSolutions || 0}
        inProgressSolutions={data?.inProgressSolutions || 0}
        completionRate={data?.completionRate || 0}
      />
      
      <DashboardActivity />
    </div>
  );
};

export default Dashboard;
