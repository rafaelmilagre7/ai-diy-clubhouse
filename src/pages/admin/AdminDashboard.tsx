
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts'; 
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';

const AdminDashboard = () => {
  const { profile } = useAuth();

  // Dados de exemplo para os gráficos
  const engagementData = [
    { name: 'Jan', value: 65 },
    { name: 'Fev', value: 59 },
    { name: 'Mar', value: 80 },
    { name: 'Abr', value: 81 },
    { name: 'Mai', value: 56 },
    { name: 'Jun', value: 55 },
    { name: 'Jul', value: 40 },
  ];

  const completionRateData = [
    { name: 'Solução A', completion: 85 },
    { name: 'Solução B', completion: 65 },
    { name: 'Solução C', completion: 76 },
    { name: 'Solução D', completion: 45 },
    { name: 'Solução E', completion: 55 },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Dashboard Administrativo" 
        description="Monitore o desempenho geral e as estatísticas da plataforma"
      />

      <StatsOverview />
      <DashboardCharts 
        engagementData={engagementData} 
        completionRateData={completionRateData} 
      />
      <RecentActivity />
    </div>
  );
};

export default AdminDashboard;
