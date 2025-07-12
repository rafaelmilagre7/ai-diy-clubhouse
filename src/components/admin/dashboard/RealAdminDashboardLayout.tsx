
import { DashboardHeader } from "./DashboardHeader";
import { RealStatsOverview } from "./RealStatsOverview";
import { RealSystemActivity } from "./RealSystemActivity";
import { UserDistributionChart } from "./UserDistributionChart";
import { SecurityMonitor } from "../SecurityMonitor";

interface RealAdminDashboardLayoutProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  statsData: any;
  activityData: any;
  loading: boolean;
}

export const RealAdminDashboardLayout = ({
  timeRange,
  setTimeRange,
  statsData,
  activityData,
  loading
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
      
      <SecurityMonitor />
    </div>
  );
};
