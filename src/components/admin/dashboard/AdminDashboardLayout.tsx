
import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { DashboardCharts } from "./DashboardCharts";
import { RecentActivity } from "./RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminDashboardLayoutProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  statsData: any;
  engagementData: any[];
  completionRateData: any[];
  recentActivities: any[];
  loading: boolean;
}

export const AdminDashboardLayout = ({
  timeRange,
  setTimeRange,
  statsData,
  engagementData,
  completionRateData,
  recentActivities,
  loading
}: AdminDashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {/* Componente de estatísticas carregado imediatamente com skeleton fallback */}
      <StatsOverview data={statsData} loading={loading} />
      
      {/* Gráficos carregados com skeletons */}
      <DashboardCharts 
        engagementData={engagementData} 
        completionRateData={completionRateData}
        loading={loading}
      />
      
      {/* Atividades recentes com skeletons */}
      <RecentActivity activities={recentActivities} loading={loading} />
    </div>
  );
};

export default AdminDashboardLayout;
