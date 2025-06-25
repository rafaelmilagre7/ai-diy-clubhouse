
import { useState, useEffect } from 'react';

interface OverviewData {
  totalUsers: number;
  totalUsersChange: number;
  activeUsers: number;
  activeUsersChange: number;
  totalSolutions: number;
  totalImplementations: number;
  newImplementations: number;
  newImplementationsChange: number;
  averageCompletion: number;
  completionRate: number;
  completionRateChange: number;
  engagementRate: number;
  engagementRateChange: number;
  recurringUsers: number;
  recurringUsersChange: number;
  avgImplementationsChange: number;
}

export const useOverviewData = (timeRange: string) => {
  const [data, setData] = useState<OverviewData>({
    totalUsers: 150,
    totalUsersChange: 12,
    activeUsers: 89,
    activeUsersChange: 8,
    totalSolutions: 25,
    totalImplementations: 89,
    newImplementations: 12,
    newImplementationsChange: 5,
    averageCompletion: 73,
    completionRate: 78,
    completionRateChange: 6,
    engagementRate: 85,
    engagementRateChange: 4,
    recurringUsers: 45,
    recurringUsersChange: 8,
    avgImplementationsChange: 3
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data baseado no timeRange
    const mockData = {
      totalUsers: timeRange === '7d' ? 150 : timeRange === '30d' ? 450 : 1200,
      totalUsersChange: timeRange === '7d' ? 12 : timeRange === '30d' ? 25 : 120,
      activeUsers: timeRange === '7d' ? 89 : timeRange === '30d' ? 280 : 850,
      activeUsersChange: timeRange === '7d' ? 8 : timeRange === '30d' ? 15 : 85,
      totalSolutions: 25,
      totalImplementations: timeRange === '7d' ? 89 : timeRange === '30d' ? 267 : 890,
      newImplementations: timeRange === '7d' ? 12 : timeRange === '30d' ? 45 : 180,
      newImplementationsChange: timeRange === '7d' ? 5 : timeRange === '30d' ? 12 : 45,
      averageCompletion: 73,
      completionRate: 78,
      completionRateChange: 6,
      engagementRate: 85,
      engagementRateChange: 4,
      recurringUsers: timeRange === '7d' ? 45 : timeRange === '30d' ? 135 : 450,
      recurringUsersChange: timeRange === '7d' ? 8 : timeRange === '30d' ? 18 : 65,
      avgImplementationsChange: 3
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  return { data, loading, error };
};
