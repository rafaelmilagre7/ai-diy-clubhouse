
import { DashboardHeader } from "./DashboardHeader";
import { RealStatsOverview } from "./RealStatsOverview";
import { RealSystemActivity } from "./RealSystemActivity";
import { UserDistributionChart } from "./UserDistributionChart";
import { DashboardCharts } from "./DashboardCharts";
import { RecentActivity } from "./RecentActivity";

interface RealAdminDashboardLayoutProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  statsData: any;
  activityData: any;
  loading: boolean;
  // Propriedades opcionais para compatibilidade com AdminDashboardLayout antigo
  engagementData?: any[];
  completionRateData?: any[];
  recentActivities?: any[];
}

export const RealAdminDashboardLayout = ({
  timeRange,
  setTimeRange,
  statsData,
  activityData,
  loading,
  engagementData = [],
  completionRateData = [],
  recentActivities = []
}: RealAdminDashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      <RealStatsOverview data={statsData} loading={loading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealSystemActivity activityData={activityData} loading={loading} />
        </div>
        <div>
          <UserDistributionChart data={statsData.usersByRole || []} loading={loading} />
        </div>
      </div>

      {/* Seção adicional para compatibilidade com layout antigo */}
      {(engagementData.length > 0 || completionRateData.length > 0) && (
        <DashboardCharts 
          engagementData={engagementData} 
          completionRateData={completionRateData}
          loading={loading}
        />
      )}

      {recentActivities.length > 0 && (
        <RecentActivity activities={recentActivities} loading={loading} />
      )}
    </div>
  );
};

// Exportar também como AdminDashboardLayout para compatibilidade
export { RealAdminDashboardLayout as AdminDashboardLayout };
