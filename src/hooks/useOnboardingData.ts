
import { useState } from 'react';

export const useOnboardingData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchOnboardingData = async () => {
    setIsLoading(true);
    try {
      console.log('Simulando busca de dados de onboarding');
      
      // Mock implementation - não fazemos mais query para user_onboarding
      const mockData = [
        {
          id: '1',
          user_id: 'user1',
          step: 'completed',
          data: {},
          created_at: new Date().toISOString()
        }
      ];
      
      setData(mockData);
      return mockData;
    } catch (error) {
      console.error('Erro ao buscar dados de onboarding:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    fetchOnboardingData
  };
};
