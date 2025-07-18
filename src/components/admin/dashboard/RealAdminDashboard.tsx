
import React, { useState } from 'react';
import { RealAdminDashboardLayout } from './RealAdminDashboardLayout';
import { useAdminStatsData } from '@/hooks/analytics/useAdminStatsData';

export const RealAdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: statsData, isLoading: loading } = useAdminStatsData();

  return (
    <RealAdminDashboardLayout
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      statsData={statsData}
      activityData={statsData?.recentActivity || []}
      loading={loading}
    />
  );
};
