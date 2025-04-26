
import React, { Suspense, lazy } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load dos componentes menos críticos
const DashboardCharts = lazy(() => import("./DashboardCharts").then((module) => ({ default: module.DashboardCharts })));
const RecentActivity = lazy(() => import("./RecentActivity").then((module) => ({ default: module.RecentActivity })));

interface AdminDashboardLayoutProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  statsData: any;
  engagementData: any[];
  completionRateData: any[];
  recentActivities: any[];
  loading: boolean;
}

// Componente de fallback para carregamento
const ChartsFallback = () => (
  <div className="space-y-6">
    <Skeleton className="h-[300px] w-full rounded-md" />
  </div>
);

const ActivityFallback = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

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

      {/* Componente de estatísticas crítico carregado imediatamente */}
      <StatsOverview data={statsData} loading={loading} />
      
      {/* Gráficos carregados de forma preguiçosa */}
      <Suspense fallback={<ChartsFallback />}>
        <DashboardCharts 
          engagementData={engagementData} 
          completionRateData={completionRateData}
          loading={loading}
        />
      </Suspense>
      
      {/* Atividades recentes carregadas por último */}
      <Suspense fallback={<ActivityFallback />}>
        <RecentActivity activities={recentActivities} loading={loading} />
      </Suspense>
    </div>
  );
};

export default AdminDashboardLayout;
