
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RealAnalyticsData {
  userGrowth: any[];
  implementationGrowth: any[];
  solutionPerformance: any[];
  coursePerformance: any[];
  userSegmentation: any[];
  engagementScores: any[];
  retentionAnalysis: any[];
  communityEngagement: any[];
  topContent: any[];
  weeklyActivity: any[];
}

export const useRealAnalyticsData = (timeRange: string = '30d') => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RealAnalyticsData>({
    userGrowth: [],
    implementationGrowth: [],
    solutionPerformance: [],
    coursePerformance: [],
    userSegmentation: [],
    engagementScores: [],
    retentionAnalysis: [],
    communityEngagement: [],
    topContent: [],
    weeklyActivity: []
  });

  useEffect(() => {
    const fetchRealAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dados em paralelo de todas as views
        const [
          userGrowthResult,
          implementationGrowthResult,
          solutionPerformanceResult,
          coursePerformanceResult,
          userSegmentationResult,
          engagementScoresResult,
          retentionAnalysisResult,
          communityEngagementResult,
          topContentResult,
          weeklyActivityResult
        ] = await Promise.allSettled([
          supabase.from('user_growth_by_date').select('*').order('date'),
          supabase.from('implementation_growth_by_date').select('*').order('date'),
          supabase.from('solution_performance_metrics').select('*').limit(10),
          supabase.from('course_performance_metrics').select('*').limit(10),
          supabase.from('user_segmentation_analytics').select('*'),
          supabase.from('user_engagement_score').select('*').limit(100),
          supabase.from('retention_cohort_analysis').select('*').limit(12),
          supabase.from('community_engagement_metrics').select('*').order('date'),
          supabase.from('top_performing_content').select('*').limit(10),
          supabase.from('weekly_activity_patterns').select('*').order('day_of_week')
        ]);

        // Processar resultados
        const processResult = (result: any) => {
          if (result.status === 'fulfilled' && result.value.data) {
            return result.value.data;
          }
          console.warn('Erro ao buscar dados:', result.reason || 'Dados não disponíveis');
          return [];
        };

        const analyticsData: RealAnalyticsData = {
          userGrowth: processResult(userGrowthResult),
          implementationGrowth: processResult(implementationGrowthResult),
          solutionPerformance: processResult(solutionPerformanceResult),
          coursePerformance: processResult(coursePerformanceResult),
          userSegmentation: processResult(userSegmentationResult),
          engagementScores: processResult(engagementScoresResult),
          retentionAnalysis: processResult(retentionAnalysisResult),
          communityEngagement: processResult(communityEngagementResult),
          topContent: processResult(topContentResult),
          weeklyActivity: processResult(weeklyActivityResult)
        };

        setData(analyticsData);
      } catch (error: any) {
        console.error('Erro ao carregar analytics:', error);
        setError(error.message || 'Erro ao carregar dados de analytics');
        toast({
          title: "Erro ao carregar analytics",
          description: "Não foi possível carregar os dados. Usando dados de exemplo.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealAnalyticsData();
  }, [timeRange, toast]);

  return { data, loading, error };
};
