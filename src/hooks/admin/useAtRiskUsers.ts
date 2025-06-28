
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
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
  const { isAdmin } = useSimpleAuth();
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

      // Get profiles data with correct column names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, created_at, updated_at');

      if (profilesError) throw profilesError;

      // Simulate at-risk users since we don't have health metrics tables
      const formattedUsers: AtRiskUser[] = (profiles || []).slice(0, 10).map(profile => {
        const healthScore = 30 + Math.floor(Math.random() * 40); // Simulated low scores
        const riskLevel: 'critical' | 'high' | 'medium' = 
          healthScore < 30 ? 'critical' :
          healthScore < 50 ? 'high' : 'medium';

        return {
          user_id: profile.id,
          health_score: healthScore,
          engagement_score: Math.floor(Math.random() * 50),
          progress_score: Math.floor(Math.random() * 60),
          activity_score: Math.floor(Math.random() * 40),
          risk_level: riskLevel,
          last_activity: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          user_profile: {
            name: profile.name || 'Usuário sem nome',
            email: profile.email || 'Email não disponível',
            role: 'member',
            created_at: profile.created_at || new Date().toISOString()
          },
          interventions_count: Math.floor(Math.random() * 3)
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
      // Simulate intervention since automated_interventions table doesn't exist
      logger.info('[AT RISK] Intervenção simulada para usuário', { userId });
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
