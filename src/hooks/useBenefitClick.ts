
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useBenefitClick = () => {
  const { user } = useAuth();

  const trackBenefitClick = useMutation({
    mutationFn: async ({ toolId, benefitLink }: { toolId: string; benefitLink: string }) => {
      if (!user) {
        throw new Error('User must be logged in to track benefit clicks');
      }

      console.log('Simulando tracking de clique no benefício:', { toolId, benefitLink, userId: user.id });
      
      // Mock implementation since benefit_clicks table doesn't exist
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, toolId, benefitLink };
    },
    onSuccess: () => {
      console.log('Clique no benefício registrado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao registrar clique no benefício:', error);
      toast.error('Erro ao registrar clique');
    }
  });

  return {
    trackBenefitClick: trackBenefitClick.mutateAsync,
    registerBenefitClick: trackBenefitClick.mutateAsync,
    isProcessing: trackBenefitClick.isPending
  };
};
