
import { useState } from 'react';
import { toast } from 'sonner';

export const useInviteAcceptance = () => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptInvite = async (token: string) => {
    setIsLoading(true);
    try {
      console.log('Simulando aceitação de convite:', token);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult = {
        success: true,
        message: 'Convite aceito com sucesso!',
        requires_onboarding: true,
        user_id: 'mock-user-id'
      };
      
      toast.success(mockResult.message);
      
      return mockResult;
    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro ao aceitar convite');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    acceptInvite,
    isLoading
  };
};
