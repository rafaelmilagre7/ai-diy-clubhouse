
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

export interface AtRiskUser {
  user_id: string;
  health_score: number;
  engagement_score: number;
  progress_score: number;
  activity_score: number;
  risk_level: 'critical' | 'high' | 'medium';
  last_activity: string | null;
  user_profile: {
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  interventions_count: number;
}

export const useAtRiskUsers = () => {
  const { isAdmin } = useAuth();
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAtRiskUsers = async () => {
    if (!isAdmin) {
      setError('Acesso negado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar usuários em risco usando user_health_metrics
      const { data: riskData, error: riskError } = await supabase
        .from('user_health_metrics')
        .select(`
          user_id,
          health_score,
          engagement_score,
          progress_score,
          activity_score,
          last_calculated_at,
          profiles:user_id (
            name,
            email,
            role,
            created_at
          )
        `)
        .lt('health_score', 70) // Usuários com score abaixo de 70
        .order('health_score', { ascending: true });

      if (riskError) {
        throw new Error(`Erro ao buscar usuários em risco: ${riskError.message}`);
      }

      // Buscar última atividade dos usuários
      const userIds = (riskData || []).map(user => user.user_id);
      let activityData: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: activities } = await supabase
          .from('user_activity_tracking')
          .select('user_id, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });

        activityData = (activities || []).reduce((acc, activity) => {
          if (!acc[activity.user_id]) {
            acc[activity.user_id] = activity.created_at;
          }
          return acc;
        }, {} as Record<string, string>);
      }

      // Buscar contagem de intervenções
      let interventionsData: Record<string, number> = {};
      if (userIds.length > 0) {
        const { data: interventions } = await supabase
          .from('automated_interventions')
          .select('user_id')
          .in('user_id', userIds);

        interventionsData = (interventions || []).reduce((acc, intervention) => {
          acc[intervention.user_id] = (acc[intervention.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }

      const formattedUsers: AtRiskUser[] = (riskData || []).map(user => {
        const healthScore = user.health_score || 0;
        const riskLevel: 'critical' | 'high' | 'medium' = 
          healthScore < 30 ? 'critical' :
          healthScore < 50 ? 'high' : 'medium';

        // Corrigir acesso aos dados do perfil
        const profileData = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;

        return {
          user_id: user.user_id,
          health_score: healthScore,
          engagement_score: user.engagement_score || 0,
          progress_score: user.progress_score || 0,
          activity_score: user.activity_score || 0,
          risk_level: riskLevel,
          last_activity: activityData[user.user_id] || null,
          user_profile: {
            name: profileData?.name || 'Usuário sem nome',
            email: profileData?.email || 'Email não disponível',
            role: profileData?.role || 'member',
            created_at: profileData?.created_at || new Date().toISOString()
          },
          interventions_count: interventionsData[user.user_id] || 0
        };
      });

      setAtRiskUsers(formattedUsers);

      logger.info('[AT RISK] Usuários em risco carregados', {
        total: formattedUsers.length,
        critical: formattedUsers.filter(u => u.risk_level === 'critical').length,
        high: formattedUsers.filter(u => u.risk_level === 'high').length,
        medium: formattedUsers.filter(u => u.risk_level === 'medium').length
      });

    } catch (error: any) {
      logger.error('[AT RISK] Erro ao carregar usuários em risco', error, {
        component: 'useAtRiskUsers'
      });
      setError(error.message || 'Erro ao carregar usuários em risco');
    } finally {
      setLoading(false);
    }
  };

  const triggerIntervention = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('automated_interventions')
        .insert({
          user_id: userId,
          trigger_condition: 'manual_intervention',
          intervention_type: 'email_engagement',
          action_taken: 'send_reengagement_email',
          scheduled_for: new Date().toISOString(),
          metadata: {
            triggered_manually: true,
            triggered_at: new Date().toISOString()
          }
        });

      if (error) {
        throw new Error(`Erro ao agendar intervenção: ${error.message}`);
      }

      logger.info('[AT RISK] Intervenção agendada para usuário', { userId });
      
      // Recarregar dados
      await fetchAtRiskUsers();

    } catch (error: any) {
      logger.error('[AT RISK] Erro ao agendar intervenção', error, {
        component: 'useAtRiskUsers',
        userId
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAtRiskUsers();
  }, [isAdmin]);

  return {
    atRiskUsers,
    loading,
    error,
    refetch: fetchAtRiskUsers,
    triggerIntervention
  };
};
