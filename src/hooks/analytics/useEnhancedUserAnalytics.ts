import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedUserAnalyticsParams {
  timeRange: string;
  segment?: string;
  search?: string;
}

interface UserOverview {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  activationRate: number;
  activationTrend: number;
  avgHealthScore: number;
  healthTrend: number;
  retentionRate: number;
  retentionTrend: number;
}

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  description: string;
  healthScore: number;
  trend: number;
}

interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

interface EnhancedUserAnalyticsData {
  overview: UserOverview;
  segments: UserSegment[];
  funnel: FunnelStep[];
  retention: any;
  activityHeatmap: any;
  growthTrend: any;
  segmentDetails: any;
  roleAnalysis: any;
  engagement: any;
  userJourney: any;
  userDetails: any[];
}

export const useEnhancedUserAnalytics = (params: EnhancedUserAnalyticsParams) => {
  const [data, setData] = useState<EnhancedUserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnhancedUserAnalytics();
  }, [params.timeRange, params.segment, params.search]);

  const fetchEnhancedUserAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Definir período baseado no timeRange
      const getDateRange = () => {
        const now = new Date();
        let startDate = new Date();
        
        switch (params.timeRange) {
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
            startDate.setFullYear(2020); // Todo o período
        }
        
        return { startDate: startDate.toISOString(), endDate: now.toISOString() };
      };

      const { startDate, endDate } = getDateRange();

      // 1. Overview via RPC seguro (bypassa RLS)
      const { data: overviewRpc, error: overviewRpcError } = await supabase
        .rpc('get_analytics_overview');
      if (overviewRpcError) throw overviewRpcError;

      // 2. Lista de usuários via função SECURITY DEFINER (inclui created_at e role)
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_users_with_roles', { limit_count: 5000, offset_count: 0, search_query: null });
      if (usersError) throw usersError;

      // Buscar flags de onboarding para os usuários (com fallback seguro)
      const userIds = (usersData as any[])?.map((u: any) => u.id) || [];
      let onboardingMap = new Map<string, boolean>();
      try {
        const { data: onboardingFlags, error: onboardingError } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .in('id', userIds);
        if (onboardingError) {
          console.warn('⚠️ [USER-ANALYTICS] Falha ao carregar onboarding flags, usando false:', onboardingError);
        }
        onboardingMap = new Map((onboardingFlags || []).map((x: any) => [x.id, x.onboarding_completed]));
      } catch (e) {
        console.warn('⚠️ [USER-ANALYTICS] Erro inesperado ao carregar onboarding flags:', e);
      }

      // Consolidar usuários com flag de onboarding
      const users = ((usersData as any[]) || []).map((u: any) => ({
        ...u,
        onboarding_completed: onboardingMap.get(u.id) || false,
      }));

      // 3. Atividade recente (se falhar, seguimos com fallback)
      const { data: activityData, error: activityError } = await supabase
        .from('analytics')
        .select('user_id, created_at, event_type')
        .gte('created_at', startDate);
      if (activityError) console.warn('⚠️ [USER-ANALYTICS] Falha ao carregar analytics, usando fallback:', activityError);

      // 4. Progresso do usuário (se falhar, seguimos com fallback)
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('user_id, solution_id, is_completed, created_at')
        .gte('created_at', startDate);
      if (progressError) console.warn('⚠️ [USER-ANALYTICS] Falha ao carregar progress, usando fallback:', progressError);

      // Processar dados para métricas
      const totalUsers = (usersData as any[])?.length || 0;
      const usersWithActivity = new Set((activityData as any[])?.map((a: any) => a.user_id) || []);
      const activeUsers = (overviewRpc as any)?.active_users ?? usersWithActivity.size;
      
      const completedOnboarding = (overviewRpc as any)?.completed_onboarding ?? 0;
      const activationRate = Math.round((overviewRpc as any)?.completion_rate ?? (
        totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0
      ));

      console.log('📊 [USER-ANALYTICS] Dados brutos:', {
        totalUsers,
        usersFetched: (usersData as any[])?.length,
        activityDataLength: (activityData as any[])?.length,
        progressDataLength: (progressData as any[])?.length,
        usersWithActivity: usersWithActivity.size,
        activeUsers,
        completedOnboarding,
        activationRate,
        timeRange: params.timeRange,
        startDate,
        endDate
      });

      // Calcular novos usuários baseado no timeRange selecionado
      const getNewUsersCount = () => {
        const now = Date.now();
        let daysBack = 30;
        
        switch (params.timeRange) {
          case '7d':
            daysBack = 7;
            break;
          case '30d':
            daysBack = 30;
            break;
          case '90d':
            daysBack = 90;
            break;
          default:
            daysBack = 365; // Para "all time", considerar último ano
        }
        
        return (usersData as any[])?.filter((u: any) => {
          const daysSinceCreation = (now - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= daysBack;
        }).length || 0;
      };

      const newUsers = getNewUsersCount();

      // Calcular Health Score baseado em múltiplos fatores
      const calculateHealthScore = (userId: string) => {
        const userActivity = (activityData as any[])?.filter((a: any) => a.user_id === userId).length || 0;
        const userProgress = (progressData as any[])?.filter((p: any) => p.user_id === userId).length || 0;
        const userProfile = (users as any[])?.find((u: any) => u.id === userId);
        
        let score = 0;
        
        // Onboarding completo: 30 pontos
        if (userProfile?.onboarding_completed) score += 30;
        
        // Atividade: até 40 pontos
        score += Math.min(40, userActivity * 2);
        
        // Progresso: até 30 pontos
        score += Math.min(30, userProgress * 3);
        
        return Math.min(100, score);
      };

      const userHealthScores = (users as any[])?.map((user: any) => ({
        id: user.id,
        healthScore: calculateHealthScore(user.id)
      })) || [];

      const avgHealthScore = userHealthScores.length > 0 
        ? Math.round(userHealthScores.reduce((sum, user) => sum + user.healthScore, 0) / userHealthScores.length)
        : 0;

      // Segmentação de usuários
      const segmentUsers = (users: any[]) => {
        const segments = {
          power_users: users.filter(u => {
            const healthScore = calculateHealthScore(u.id);
            return healthScore >= 80;
          }),
          active: users.filter(u => {
            const healthScore = calculateHealthScore(u.id);
            return healthScore >= 50 && healthScore < 80;
          }),
          dormant: users.filter(u => {
            const healthScore = calculateHealthScore(u.id);
            const hasRecentActivity = activityData?.some(a => 
              a.user_id === u.id && 
              new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            );
            return healthScore < 50 && !hasRecentActivity;
          }),
          at_risk: users.filter(u => {
            const daysSinceCreation = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return !u.onboarding_completed && daysSinceCreation > 7;
          }),
          new: users.filter(u => {
            const daysSinceCreation = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreation <= 7;
          })
        };

        return Object.entries(segments).map(([key, users]) => ({
          name: getSegmentName(key),
          count: users.length,
          percentage: totalUsers > 0 ? Math.round((users.length / totalUsers) * 100) : 0,
          description: getSegmentDescription(key),
          healthScore: users.length > 0 
            ? Math.round(users.reduce((sum, u) => sum + calculateHealthScore(u.id), 0) / users.length)
            : 0,
          trend: Math.floor(Math.random() * 20) - 10 // Mock trend
        }));
      };

      const segments = segmentUsers(users || []);

      // Funil de conversão
      const funnel: FunnelStep[] = [
        {
          name: 'Cadastro',
          users: totalUsers,
          conversionRate: 100,
          dropoffRate: 0
        },
        {
          name: 'Primeiro Login',
          users: Math.round(Math.max(totalUsers, activeUsers) * 0.85),
          conversionRate: 85,
          dropoffRate: 15
        },
        {
          name: 'Onboarding Iniciado',
          users: Math.round(Math.max(totalUsers, activeUsers) * 0.70),
          conversionRate: 70,
          dropoffRate: 30
        },
        {
          name: 'Onboarding Completo',
          users: completedOnboarding,
          conversionRate: activationRate,
          dropoffRate: Math.max(0, 100 - activationRate)
        },
        {
          name: 'Primeiro Engajamento',
          users: activeUsers,
          conversionRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          dropoffRate: totalUsers > 0 ? Math.round(100 - (activeUsers / totalUsers) * 100) : 0
        }
      ];

      // Análise por papel
      const roleAnalysis = {
        roles: [
          {
            name: 'Membro Club',
            count: (users as any[])?.filter((u: any) => u.user_roles?.name === 'membro_club' || u.user_roles?.[0]?.name === 'membro_club').length || 0,
            completionRate: 75,
            engagementScore: 82
          },
          {
            name: 'Admin',
            count: (users as any[])?.filter((u: any) => u.user_roles?.name === 'admin' || u.user_roles?.[0]?.name === 'admin').length || 0,
            completionRate: 95,
            engagementScore: 95
          },
          {
            name: 'Formação',
            count: (users as any[])?.filter((u: any) => u.user_roles?.name === 'formacao' || u.user_roles?.[0]?.name === 'formacao').length || 0,
            completionRate: 60,
            engagementScore: 70
          }
        ]
      };

      const analyticsData: EnhancedUserAnalyticsData = {
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          userGrowth: 12, // Mock - calcular baseado em dados históricos
          activationRate,
          activationTrend: 5, // Mock
          avgHealthScore,
          healthTrend: 8, // Mock
          retentionRate: 78, // Mock - calcular baseado em dados de atividade
          retentionTrend: 3 // Mock
        },
        segments,
        funnel,
        retention: {}, // Implementar cálculos de retenção por coorte
        activityHeatmap: {}, // Dados de heatmap de atividade por dia/hora
        growthTrend: {
          projectedGrowth: 45,
          growthProgress: 68,
          organicGrowth: 82,
          referralGrowth: 18
        },
        segmentDetails: segments,
        roleAnalysis,
        engagement: {
          avgSessionTime: '25m',
          pageViewsPerSession: 4.2,
          featureAdoption: 78,
          dailyActiveUsers: activeUsers
        },
        userJourney: {
          dropoffPoints: [
            {
              page: 'Onboarding - Perfil',
              description: 'Usuários abandonam ao preencher dados pessoais',
              dropoffRate: 23,
              users: Math.round(totalUsers * 0.23)
            },
            {
              page: 'Dashboard Inicial',
              description: 'Primeira visita ao dashboard principal',
              dropoffRate: 18,
              users: Math.round(totalUsers * 0.18)
            },
            {
              page: 'Primeira Solução',
              description: 'Acesso à primeira solução da plataforma',
              dropoffRate: 15,
              users: Math.round(totalUsers * 0.15)
            }
          ]
        },
        userDetails: (users as any[])?.slice(0, 50).map((user: any) => ({
          ...user,
          healthScore: calculateHealthScore(user.id),
          lastActivity: (activityData as any[])?.filter((a: any) => a.user_id === user.id).sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]?.created_at,
          activityCount: (activityData as any[])?.filter((a: any) => a.user_id === user.id).length || 0,
          segment: getUserSegment(user.id, calculateHealthScore(user.id))
        })) || []
      };

      setData(analyticsData);
      
    } catch (err: any) {
      console.error('Erro ao buscar analytics de usuários:', err);
      setError(err.message || 'Erro ao carregar dados de usuários');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error };
};

// Helper functions
const getSegmentName = (key: string): string => {
  const names: Record<string, string> = {
    power_users: 'Power Users',
    active: 'Ativos',
    dormant: 'Dormentes',
    at_risk: 'Em Risco',
    new: 'Novos'
  };
  return names[key] || key;
};

const getSegmentDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    power_users: 'Usuários altamente engajados com health score acima de 80',
    active: 'Usuários com boa atividade regular na plataforma',
    dormant: 'Usuários com baixa atividade recente',
    at_risk: 'Usuários que não completaram onboarding há mais de 7 dias',
    new: 'Usuários cadastrados nos últimos 7 dias'
  };
  return descriptions[key] || '';
};

const getUserSegment = (userId: string, healthScore: number): string => {
  if (healthScore >= 80) return 'Power User';
  if (healthScore >= 50) return 'Ativo';
  if (healthScore < 30) return 'Em Risco';
  return 'Dormentes';
};