
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { DashboardCharts } from "./DashboardCharts";
import { RecentActivity } from "./RecentActivity";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Administrativo"
        description="Visão geral completa da plataforma e métricas de desempenho"
      />

      <div className="space-y-6">
        <DashboardHeader 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        <StatsOverview data={statsData} loading={loading} />
        
        <DashboardCharts 
          engagementData={engagementData} 
          completionRateData={completionRateData}
          loading={loading}
        />
        
        <RecentActivity activities={recentActivities} loading={loading} />
      </div>
    </div>
  );
};
