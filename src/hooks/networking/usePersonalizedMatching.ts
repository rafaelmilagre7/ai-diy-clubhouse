
import { useQuery } from '@tanstack/react-query';
import { useOnboardingPersonalization } from '@/hooks/onboarding/useOnboardingPersonalization';
import { AIPersonalizationService } from '@/services/aiPersonalization';

export function usePersonalizedMatching() {
  const { data: personalizationData, isLoading: personalizationLoading } = useOnboardingPersonalization();

  return useQuery({
    queryKey: ['personalized-matching', personalizationData?.email],
    queryFn: async () => {
      if (!personalizationData) return null;

      const networkingPersonalization = AIPersonalizationService.generateNetworkingPersonalization(personalizationData);
      
      return {
        targetCustomerProfile: networkingPersonalization.targetCustomerProfile,
        targetSupplierProfile: networkingPersonalization.targetSupplierProfile,
        industries: networkingPersonalization.industries,
        companySizes: networkingPersonalization.companySizes,
        keySkills: networkingPersonalization.keySkills,
        businessObjectives: networkingPersonalization.businessObjectives,
        userProfile: {
          name: personalizationData.name,
          company: personalizationData.company_name,
          role: personalizationData.role,
          segment: personalizationData.company_segment,
          size: personalizationData.company_size
        }
      };
    },
    enabled: !!personalizationData && personalizationData.is_completed,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
