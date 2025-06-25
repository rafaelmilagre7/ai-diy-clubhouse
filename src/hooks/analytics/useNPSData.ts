
import { useState, useEffect } from 'react';

interface NPSData {
  avg_nps: number;
  total_responses: number;
  nps_over_time: Array<{ date: string; score: number }>;
  nps_per_lesson: Array<{ lesson: string; score: number; responses: number }>;
}

export const useNPSData = ({ timeRange }: { timeRange: string }) => {
  const [data, setData] = useState<NPSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockData: NPSData = {
      avg_nps: 8.5,
      total_responses: 150,
      nps_over_time: [
        { date: '2024-01-01', score: 8.2 },
        { date: '2024-01-15', score: 8.5 }
      ],
      nps_per_lesson: [
        { lesson: 'Introdução ao AI', score: 9.0, responses: 25 },
        { lesson: 'Automação Básica', score: 8.0, responses: 30 }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  return { data, loading, error };
};
