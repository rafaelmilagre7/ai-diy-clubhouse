
import { useState } from "react";
import { useAdminDashboardData } from "@/hooks/admin/useAdminDashboardData";
import { AdminDashboardLayout } from "@/components/admin/dashboard/AdminDashboardLayout";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const {
    statsData,
    engagementData,
    completionRateData,
    recentActivities,
    loading
  } = useAdminDashboardData(timeRange);

  return (
    <AdminDashboardLayout
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      statsData={statsData}
      engagementData={engagementData}
      completionRateData={completionRateData}
      recentActivities={recentActivities}
      loading={loading}
    />
  );
};

export default AdminDashboard;
