
import { useQuery } from '@tanstack/react-query';
import { useOnboardingPersonalization } from '@/hooks/onboarding/useOnboardingPersonalization';
import { AIPersonalizationService } from '@/services/aiPersonalization';

export function usePersonalizedTrail() {
  const { data: personalizationData, isLoading: personalizationLoading } = useOnboardingPersonalization();

  return useQuery({
    queryKey: ['personalized-trail', personalizationData?.email],
    queryFn: async () => {
      if (!personalizationData) return null;

      const trailPersonalization = AIPersonalizationService.generateTrailPersonalization(personalizationData);
      
      return {
        skillLevel: trailPersonalization.skillLevel,
        focusAreas: trailPersonalization.focusAreas,
        recommendedSolutions: trailPersonalization.recommendedSolutions,
        learningPath: trailPersonalization.learningPath,
        implementationPriority: trailPersonalization.implementationPriority,
        userProfile: {
          name: personalizationData.name,
          company: personalizationData.company_name,
          role: personalizationData.role,
          segment: personalizationData.company_segment,
          experience: personalizationData.ai_knowledge_level
        }
      };
    },
    enabled: !!personalizationData && personalizationData.is_completed,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
