
import { useState } from 'react';

export const useOnboardingData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Simulando busca de dados de onboarding');
      
      // Mock implementation - simulating onboarding data structure
      const mockData = {
        id: '1',
        user_id: 'user1',
        step: 'completed',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+5511999999999',
        company: 'Tech Corp',
        position: 'CEO',
        aiKnowledgeLevel: 'intermediate',
        memberType: 'club',
        businessSector: 'technology',
        companyName: 'Tech Corp',
        completedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      setData(mockData);
      return mockData;
    } catch (error: any) {
      console.error('Erro ao buscar dados de onboarding:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchOnboardingData
  };
};
