import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RealAnalyticsData {
  engagement_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    avg_session_time_minutes: number;
    bounce_rate_percentage: number;
  };
  user_growth: {
    growth_data: Array<{
      date: string;
      new_users: number;
      total_users: number;
    }>;
    retention_data: Array<{
      cohort_week: string;
      retention_week_1: number;
      retention_week_2: number;
      retention_week_4: number;
    }>;
  };
  user_journey: {
    funnel_data: {
      total_users: number;
      completed_onboarding: number;
      started_solution: number;
      completed_solution: number;
      requested_implementation: number;
    };
    conversion_rates: {
      onboarding_conversion: number;
      solution_start_conversion: number;
      solution_completion_conversion: number;
      implementation_request_conversion: number;
    };
  };
}

export const useRealAnalyticsData = (timeRange: string = '30_days') => {
  const [data, setData] = useState<RealAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRealAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas de engajamento
        const { data: engagementData, error: engagementError } = await supabase
          .rpc('get_user_engagement_metrics', { time_range: timeRange });

        if (engagementError) throw engagementError;

        // Buscar trends de crescimento
        const { data: growthData, error: growthError } = await supabase
          .rpc('get_user_growth_trends', { time_range: timeRange });

        if (growthError) throw growthError;

        // Buscar analytics de jornada do usuário
        const { data: journeyData, error: journeyError } = await supabase
          .rpc('get_user_journey_analytics', { time_range: timeRange });

        if (journeyError) throw journeyError;

        const analyticsData: RealAnalyticsData = {
          engagement_metrics: engagementData || {
            daily_active_users: 0,
            weekly_active_users: 0,
            monthly_active_users: 0,
            avg_session_time_minutes: 0,
            bounce_rate_percentage: 0,
          },
          user_growth: growthData || {
            growth_data: [],
            retention_data: [],
          },
          user_journey: journeyData || {
            funnel_data: {
              total_users: 0,
              completed_onboarding: 0,
              started_solution: 0,
              completed_solution: 0,
              requested_implementation: 0,
            },
            conversion_rates: {
              onboarding_conversion: 0,
              solution_start_conversion: 0,
              solution_completion_conversion: 0,
              implementation_request_conversion: 0,
            },
          },
        };

        setData(analyticsData);

      } catch (err: any) {
        console.error(`[RealAnalytics] Erro ao carregar dados:`, err);
        setError(err.message);
        
        toast({
          title: "Erro no Analytics",
          description: "Não foi possível carregar os dados reais do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealAnalyticsData();
  }, [timeRange, toast]);

  return {
    data,
    loading,
    error,
    hasData: !!data,
    isDataReal: !loading && !error && !!data,
  };
};