
import { useState, useEffect } from 'react';

interface NPSOverallData {
  overall: number;
  distribution: {
    promoters: number;
    neutrals: number;
    detractors: number;
  };
}

interface NPSPerLessonData {
  perLesson: Array<{
    lessonId: string;
    lessonTitle: string;
    npsScore: number;
    responseCount?: number;
  }>;
}

interface NPSData {
  avg_nps: number;
  total_responses: number;
  nps_over_time: Array<{ date: string; score: number }>;
  nps_per_lesson: Array<{ lesson: string; score: number; responses: number }>;
  overall_data: NPSOverallData;
  per_lesson_data: NPSPerLessonData;
}

export const useNPSData = (timeRange: string) => {
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
      ],
      overall_data: {
        overall: 8.5,
        distribution: {
          promoters: 120,
          neutrals: 20,
          detractors: 10
        }
      },
      per_lesson_data: {
        perLesson: [
          {
            lessonId: '1',
            lessonTitle: 'Introdução ao AI',
            npsScore: 9.0,
            responseCount: 25
          },
          {
            lessonId: '2',
            lessonTitle: 'Automação Básica',
            npsScore: 8.0,
            responseCount: 30
          }
        ]
      }
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  return { data, loading, error };
};
