
import { useState } from 'react';

export interface ImplementationData {
  id: string;
  user_id: string;
  solution_id: string;
  status: string;
  progress: number;
  created_at: string;
}

export const useImplementationData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ImplementationData[]>([]);

  const fetchImplementationData = async () => {
    setIsLoading(true);
    try {
      // Mock implementation to avoid deep types
      const mockData: ImplementationData[] = [
        {
          id: '1',
          user_id: 'user1',
          solution_id: 'solution1',
          status: 'completed',
          progress: 100,
          created_at: new Date().toISOString()
        }
      ];
      
      setData(mockData);
      return mockData;
    } catch (error) {
      console.error('Erro ao buscar dados de implementação:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    fetchImplementationData
  };
};
