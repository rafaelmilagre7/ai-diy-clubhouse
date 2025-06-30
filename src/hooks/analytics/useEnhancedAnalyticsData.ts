
import { useMemo } from 'react';
import { useRealAnalyticsData } from './useRealAnalyticsData';

export const useEnhancedAnalyticsData = (timeRange: string = '30d') => {
  const { data: rawData, loading, error } = useRealAnalyticsData(timeRange);

  const processedData = useMemo(() => {
    if (loading || error) return null;

    // Transformar dados para os formatos esperados pelos gráficos
    const usersByTime = rawData.userGrowth.map(item => ({
      date: item.date,
      name: item.name,
      usuarios: item.novos,
      total: item.total,
      novos: item.novos
    }));

    const solutionPopularity = rawData.solutionPerformance
      .slice(0, 5)
      .map(item => ({
        name: item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title,
        value: item.total_implementations
      }));

    const implementationsByCategory = rawData.solutionPerformance
      .reduce((acc: any, item) => {
        const existing = acc.find((a: any) => a.name === item.category);
        if (existing) {
          existing.value += item.total_implementations;
        } else {
          acc.push({
            name: item.category,
            value: item.total_implementations
          });
        }
        return acc;
      }, []);

    const userCompletionRate = [
      {
        name: 'Concluídas',
        value: rawData.solutionPerformance.reduce((sum, item) => sum + item.completed_implementations, 0)
      },
      {
        name: 'Em andamento',
        value: rawData.solutionPerformance.reduce((sum, item) => sum + (item.total_implementations - item.completed_implementations), 0)
      }
    ];

    const dayOfWeekActivity = rawData.weeklyActivity.map(item => ({
      day: item.day,
      atividade: item.atividade
    }));

    // Dados de engajamento avançado
    const engagementData = rawData.engagementScores
      .slice(0, 20)
      .map(item => ({
        name: item.name || 'Usuário',
        score: item.total_engagement_score,
        level: item.engagement_level,
        implementations: item.implementation_score / 2,
        completions: item.completion_score / 5
      }));

    // Dados de retenção
    const retentionData = rawData.retentionAnalysis.map(item => ({
      cohort: item.cohort_name,
      size: item.cohort_size,
      month1: item.month_1_retention_rate || 0,
      month2: item.month_2_retention_rate || 0,
      month3: item.month_3_retention_rate || 0
    }));

    // Performance de conteúdo
    const contentPerformance = rawData.topContent.map(item => ({
      type: item.content_type,
      title: item.content_title,
      category: item.category,
      engagement: item.engagement_count,
      completions: item.completion_count,
      unit: item.engagement_unit
    }));

    return {
      // Dados básicos para gráficos existentes
      usersByTime,
      solutionPopularity,
      implementationsByCategory,
      userCompletionRate,
      dayOfWeekActivity,

      // Dados avançados
      engagementData,
      retentionData,
      contentPerformance,
      userSegmentation: rawData.userSegmentation,
      coursePerformance: rawData.coursePerformance,
      forumEngagement: rawData.forumEngagement,

      // Métricas resumidas
      metrics: {
        totalUsers: rawData.userSegmentation.reduce((sum, item) => sum + item.user_count, 0),
        activeUsers: rawData.userSegmentation.reduce((sum, item) => sum + item.active_users_7d, 0),
        totalImplementations: rawData.solutionPerformance.reduce((sum, item) => sum + item.total_implementations, 0),
        completionRate: rawData.solutionPerformance.length > 0 
          ? Math.round(rawData.solutionPerformance.reduce((sum, item) => sum + item.completion_rate, 0) / rawData.solutionPerformance.length)
          : 0,
        avgEngagementScore: rawData.engagementScores.length > 0
          ? Math.round(rawData.engagementScores.reduce((sum, item) => sum + item.total_engagement_score, 0) / rawData.engagementScores.length)
          : 0
      }
    };
  }, [rawData, loading, error]);

  return {
    data: processedData,
    loading,
    error,
    rawData
  };
};
