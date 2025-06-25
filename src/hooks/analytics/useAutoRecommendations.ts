
import { useState, useEffect } from 'react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  updated_at: string;
}

export const useAutoRecommendations = (timeRange: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        title: 'Oportunidade de Melhoria',
        description: 'Identifique pontos de otimização em seu processo',
        type: 'opportunity',
        priority: 'high',
        updated_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleImplementRecommendation = async (id: string) => {
    console.log('Implementando recomendação:', id);
  };

  const handleDismissRecommendation = async (id: string) => {
    console.log('Ignorando recomendação:', id);
  };

  return {
    recommendations,
    loading,
    error,
    handleImplementRecommendation,
    handleDismissRecommendation
  };
};
