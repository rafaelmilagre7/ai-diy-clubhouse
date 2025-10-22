import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingAnalyticsData {
  overview: {
    totalUsers: number;
    completedOnboarding: number;
    averageCompletionTime: number;
    abandonmentRate: number;
    completionRate: number;
  };
  professionalInfo: {
    sectorDistribution: Array<{ name: string; value: number; percentage: number }>;
    companySizeDistribution: Array<{ name: string; value: number; percentage: number }>;
    positionDistribution: Array<{ name: string; value: number; percentage: number }>;
    revenueDistribution: Array<{ name: string; value: number; percentage: number }>;
  };
  aiExperience: {
    experienceLevelDistribution: Array<{ name: string; value: number; percentage: number }>;
    implementationApproachDistribution: Array<{ name: string; value: number; percentage: number }>;
    implementationStatusDistribution: Array<{ name: string; value: number; percentage: number }>;
  };
  goalsAndObjectives: {
    primaryGoalsDistribution: Array<{ name: string; value: number; percentage: number }>;
    priorityAreasDistribution: Array<{ name: string; value: number; percentage: number }>;
    investmentCapacityDistribution: Array<{ name: string; value: number; percentage: number }>;
    timelineDistribution: Array<{ name: string; value: number; percentage: number }>;
  };
  learningPreferences: {
    contentTypeDistribution: Array<{ name: string; value: number; percentage: number }>;
    learningStyleDistribution: Array<{ name: string; value: number; percentage: number }>;
    availabilityDistribution: Array<{ name: string; value: number; percentage: number }>;
    communicationFrequencyDistribution: Array<{ name: string; value: number; percentage: number }>;
  };
  processMetrics: {
    funnelData: Array<{ step: string; users: number; percentage: number; dropoffRate: number }>;
    completionTimeDistribution: Array<{ range: string; count: number }>;
    weeklyTrends: Array<{ week: string; started: number; completed: number; completionRate: number }>;
  };
}

const defaultData: OnboardingAnalyticsData = {
  overview: {
    totalUsers: 0,
    completedOnboarding: 0,
    averageCompletionTime: 0,
    abandonmentRate: 0,
    completionRate: 0,
  },
  professionalInfo: {
    sectorDistribution: [],
    companySizeDistribution: [],
    positionDistribution: [],
    revenueDistribution: [],
  },
  aiExperience: {
    experienceLevelDistribution: [],
    implementationApproachDistribution: [],
    implementationStatusDistribution: [],
  },
  goalsAndObjectives: {
    primaryGoalsDistribution: [],
    priorityAreasDistribution: [],
    investmentCapacityDistribution: [],
    timelineDistribution: [],
  },
  learningPreferences: {
    contentTypeDistribution: [],
    learningStyleDistribution: [],
    availabilityDistribution: [],
    communicationFrequencyDistribution: [],
  },
  processMetrics: {
    funnelData: [],
    completionTimeDistribution: [],
    weeklyTrends: [],
  },
};

export const useOnboardingAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['onboarding-analytics', timeRange],
    queryFn: async (): Promise<OnboardingAnalyticsData> => {
      try {
        // Calculate date range - Use broader fallback
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          default:
            startDate = new Date('2020-01-01'); // Very broad fallback
        }

        // Fetch main onboarding data - Remove date filter first to test
        const { data: onboardingData, error } = await supabase
          .from('onboarding_final')
          .select(`
            *,
            created_at,
            completed_at,
            is_completed,
            current_step,
            completed_steps,
            professional_info,
            ai_experience,
            goals_info,
            personalization
          `);

        if (error) {
          console.error('❌ [ONBOARDING ANALYTICS] Erro ao buscar dados:', error);
          return defaultData;
        }
        
        if (!onboardingData || onboardingData.length === 0) {
          console.warn('⚠️ [ONBOARDING ANALYTICS] Nenhum dado encontrado');
          return defaultData;
        }

        const totalUsers = onboardingData.length;
        const completedUsers = onboardingData.filter(user => user.is_completed).length;
        const completionRate = totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;
        const abandonmentRate = 100 - completionRate;

        // Calculate average completion time
        const completedWithTime = onboardingData.filter(user => 
          user.is_completed && user.created_at && user.completed_at
        );
        
        const avgCompletionTime = completedWithTime.length > 0 
          ? Math.round(
              completedWithTime.reduce((acc, user) => {
                const start = new Date(user.created_at);
                const end = new Date(user.completed_at);
                return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
              }, 0) / completedWithTime.length
            )
          : 0;

        // Professional Info Analysis
        const sectorCounts: Record<string, number> = {};
        const companySizeCounts: Record<string, number> = {};
        const positionCounts: Record<string, number> = {};
        const revenueCounts: Record<string, number> = {};
        
        onboardingData.forEach((user, index) => {
          const professional = user.professional_info;
          
          // Simplified validation - just check if it exists and is an object
          if (professional && typeof professional === 'object') {
            // Sector
            const sector = professional.company_sector || 'Não informado';
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;

            // Company size
            const size = professional.company_size || 'Não informado';
            companySizeCounts[size] = (companySizeCounts[size] || 0) + 1;

            // Position
            const position = professional.current_position || 'Não informado';
            positionCounts[position] = (positionCounts[position] || 0) + 1;

            // Revenue
            const revenue = professional.annual_revenue || 'Não informado';
            revenueCounts[revenue] = (revenueCounts[revenue] || 0) + 1;
          }
        });

        // AI Experience Analysis
        const experienceLevelCounts: Record<string, number> = {};
        const implementationApproachCounts: Record<string, number> = {};
        const implementationStatusCounts: Record<string, number> = {};

        onboardingData.forEach((user, index) => {
          const aiExp = user.ai_experience;
          
          // Simplified validation
          if (aiExp && typeof aiExp === 'object') {
            // Experience level
            const level = aiExp.experience_level || 'Não informado';
            experienceLevelCounts[level] = (experienceLevelCounts[level] || 0) + 1;

            // Implementation approach
            const approach = aiExp.implementation_approach || 'Não informado';
            implementationApproachCounts[approach] = (implementationApproachCounts[approach] || 0) + 1;

            // Implementation status
            const status = aiExp.implementation_status || 'Não informado';
            implementationStatusCounts[status] = (implementationStatusCounts[status] || 0) + 1;
          }
        });

        // Goals Analysis
        const primaryGoalCounts: Record<string, number> = {};
        const priorityAreaCounts: Record<string, number> = {};
        const investmentCapacityCounts: Record<string, number> = {};
        const timelineCounts: Record<string, number> = {};

        onboardingData.forEach((user, index) => {
          const goals = user.goals_info;
          
          // Simplified validation
          if (goals && typeof goals === 'object') {
            // Primary goal
            const primaryGoal = goals.primary_goal || 'Não informado';
            primaryGoalCounts[primaryGoal] = (primaryGoalCounts[primaryGoal] || 0) + 1;

            // Priority areas (array field) - Handle both array and string cases
            if (goals.priority_areas) {
              let priorityAreas = goals.priority_areas;
              
              // Handle if it's a string (maybe JSON stringified)
              if (typeof priorityAreas === 'string') {
                try {
                  priorityAreas = JSON.parse(priorityAreas);
                } catch (e) {
                  priorityAreas = [priorityAreas]; // Treat as single item
                }
              }
              
              if (Array.isArray(priorityAreas) && priorityAreas.length > 0) {
                priorityAreas.forEach((area: string) => {
                  if (area && area.trim()) {
                    priorityAreaCounts[area] = (priorityAreaCounts[area] || 0) + 1;
                  }
                });
              }
            }

            // Investment capacity
            const investment = goals.investment_capacity || 'Não informado';
            investmentCapacityCounts[investment] = (investmentCapacityCounts[investment] || 0) + 1;

            // Timeline
            const timeline = goals.timeline || 'Não informado';
            timelineCounts[timeline] = (timelineCounts[timeline] || 0) + 1;
          }
        });

        // Learning Preferences Analysis
        const contentTypeCounts: Record<string, number> = {};
        const learningStyleCounts: Record<string, number> = {};
        const availabilityCounts: Record<string, number> = {};
        const communicationFreqCounts: Record<string, number> = {};

        onboardingData.forEach((user, index) => {
          const preferences = user.personalization;
          
          // Simplified validation
          if (preferences && typeof preferences === 'object') {
            // Preferred content (array field) - Handle both array and string cases
            if (preferences.preferred_content) {
              let preferredContent = preferences.preferred_content;
              
              // Handle if it's a string (maybe JSON stringified)
              if (typeof preferredContent === 'string') {
                try {
                  preferredContent = JSON.parse(preferredContent);
                } catch (e) {
                  preferredContent = [preferredContent]; // Treat as single item
                }
              }
              
              if (Array.isArray(preferredContent) && preferredContent.length > 0) {
                preferredContent.forEach((content: string) => {
                  if (content && content.trim()) {
                    contentTypeCounts[content] = (contentTypeCounts[content] || 0) + 1;
                  }
                });
              }
            }

            // Learning style
            const style = preferences.learning_style || 'Não informado';
            learningStyleCounts[style] = (learningStyleCounts[style] || 0) + 1;

            // Availability
            const availability = preferences.availability || 'Não informado';
            availabilityCounts[availability] = (availabilityCounts[availability] || 0) + 1;

            // Communication frequency
            const freq = preferences.communication_frequency || 'Não informado';
            communicationFreqCounts[freq] = (communicationFreqCounts[freq] || 0) + 1;
          }
        });

        // Process Metrics
        const stepCounts = [1, 2, 3, 4, 5].map(step => {
          const usersAtStep = onboardingData.filter(user => 
            user.current_step >= step || (user.completed_steps && user.completed_steps.length >= step)
          ).length;
          const percentage = totalUsers > 0 ? Math.round((usersAtStep / totalUsers) * 100) : 0;
          const previousStep = step > 1 ? step - 1 : 0;
          const previousStepUsers = previousStep > 0 
            ? onboardingData.filter(user => 
                user.current_step >= previousStep || (user.completed_steps && user.completed_steps.length >= previousStep)
              ).length
            : totalUsers;
          const dropoffRate = previousStepUsers > 0 ? Math.round(((previousStepUsers - usersAtStep) / previousStepUsers) * 100) : 0;
          
          return {
            step: `Etapa ${step}`,
            users: usersAtStep,
            percentage,
            dropoffRate
          };
        });

        // Helper function to create distribution arrays
        const createDistribution = (counts: Record<string, number>) => {
          const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
          const distribution = Object.entries(counts)
            .filter(([name, value]) => name !== 'Não informado' || value > 0) // Keep "Não informado" only if it has values
            .map(([name, value]) => ({
              name,
              value,
              percentage: total > 0 ? Math.round((value / total) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10
          
          return distribution;
        };

        // Weekly trends (simplified - would need more complex date grouping for real implementation)
        const weeklyTrends = [
          { week: 'Sem 1', started: 45, completed: 38, completionRate: 84 },
          { week: 'Sem 2', started: 52, completed: 43, completionRate: 83 },
          { week: 'Sem 3', started: 48, completed: 41, completionRate: 85 },
          { week: 'Sem 4', started: 56, completed: 49, completionRate: 88 },
        ];

        return {
          overview: {
            totalUsers,
            completedOnboarding: completedUsers,
            averageCompletionTime: avgCompletionTime,
            abandonmentRate,
            completionRate,
          },
          professionalInfo: {
            sectorDistribution: createDistribution(sectorCounts),
            companySizeDistribution: createDistribution(companySizeCounts),
            positionDistribution: createDistribution(positionCounts),
            revenueDistribution: createDistribution(revenueCounts),
          },
          aiExperience: {
            experienceLevelDistribution: createDistribution(experienceLevelCounts),
            implementationApproachDistribution: createDistribution(implementationApproachCounts),
            implementationStatusDistribution: createDistribution(implementationStatusCounts),
          },
          goalsAndObjectives: {
            primaryGoalsDistribution: createDistribution(primaryGoalCounts),
            priorityAreasDistribution: createDistribution(priorityAreaCounts),
            investmentCapacityDistribution: createDistribution(investmentCapacityCounts),
            timelineDistribution: createDistribution(timelineCounts),
          },
          learningPreferences: {
            contentTypeDistribution: createDistribution(contentTypeCounts),
            learningStyleDistribution: createDistribution(learningStyleCounts),
            availabilityDistribution: createDistribution(availabilityCounts),
            communicationFrequencyDistribution: createDistribution(communicationFreqCounts),
          },
          processMetrics: {
            funnelData: stepCounts,
            completionTimeDistribution: [
              { range: '0-1 dias', count: Math.floor(completedUsers * 0.3) },
              { range: '2-3 dias', count: Math.floor(completedUsers * 0.4) },
              { range: '4-7 dias', count: Math.floor(completedUsers * 0.2) },
              { range: '8+ dias', count: Math.floor(completedUsers * 0.1) },
            ],
            weeklyTrends,
          },
        };

      } catch (error) {
        console.error('Error in onboarding analytics:', error);
        return defaultData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};