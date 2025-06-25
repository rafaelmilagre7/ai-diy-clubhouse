
import { useState, useEffect } from 'react';

interface OverviewData {
  totalUsers: number;
  totalSolutions: number;
  totalImplementations: number;
  averageCompletion: number;
}

export const useOverviewData = (timeRange: string) => {
  const [data, setData] = useState<OverviewData>({
    totalUsers: 0,
    totalSolutions: 0,
    totalImplementations: 0,
    averageCompletion: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data para evitar erros de compilação
    const mockData = {
      totalUsers: 150,
      totalSolutions: 25,
      totalImplementations: 89,
      averageCompletion: 73
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  return { data, loading, error };
};
