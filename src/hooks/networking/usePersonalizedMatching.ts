
import { useQuery } from '@tanstack/react-query';

export function usePersonalizedMatching() {
  return useQuery({
    queryKey: ['personalized-matching'],
    queryFn: async () => {
      // Placeholder implementation - can be enhanced later
      return {
        targetCustomerProfile: 'Empresas de tecnologia',
        targetSupplierProfile: 'Fornecedores especializados',
        industries: ['technology', 'services'],
        companySizes: ['small', 'medium'],
        keySkills: ['AI', 'automation'],
        businessObjectives: ['growth', 'efficiency'],
        userProfile: {
          name: 'Usuário',
          company: '',
          role: '',
          segment: '',
          size: 'medium'
        }
      };
    },
    enabled: false, // Disabled until proper implementation
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
