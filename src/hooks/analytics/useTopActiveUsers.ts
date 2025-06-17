
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  company: string;
  role: string;
  activityCount: number;
  lastSeen: string;
}

export const useTopActiveUsers = (limit: number = 10) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopActiveUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar usuários mais ativos baseado na tabela analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select(`
            user_id,
            created_at
          `)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        if (analyticsError) throw analyticsError;

        // Contar atividades por usuário
        const userActivityCount = analyticsData?.reduce((acc, activity) => {
          const userId = activity.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              count: 0,
              lastSeen: activity.created_at
            };
          }
          acc[userId].count++;
          // Manter a data mais recente
          if (new Date(activity.created_at) > new Date(acc[userId].lastSeen)) {
            acc[userId].lastSeen = activity.created_at;
          }
          return acc;
        }, {} as Record<string, { count: number; lastSeen: string }>) || {};

        // Buscar dados dos usuários mais ativos
        const topUserIds = Object.entries(userActivityCount)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, limit)
          .map(([userId]) => userId);

        if (topUserIds.length === 0) {
          setUsers([]);
          return;
        }

        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            avatar_url,
            company_name,
            role,
            user_roles!inner(name)
          `)
          .in('id', topUserIds);

        if (usersError) throw usersError;

        // Combinar dados dos usuários com contadores de atividade
        const activeUsers: ActiveUser[] = usersData?.map(user => {
          const userRoleData = Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles;
          const activity = userActivityCount[user.id];
          
          return {
            id: user.id,
            name: user.name || 'Usuário',
            email: user.email || '',
            avatarUrl: user.avatar_url || undefined,
            company: user.company_name || 'Não informado',
            role: userRoleData?.name || user.role || 'member',
            activityCount: activity.count,
            lastSeen: activity.lastSeen
          };
        }).sort((a, b) => b.activityCount - a.activityCount) || [];

        setUsers(activeUsers);

      } catch (err: any) {
        console.error('Erro ao buscar usuários mais ativos:', err);
        setError(err.message || 'Erro ao carregar usuários ativos');
        toast({
          title: "Erro ao carregar usuários ativos",
          description: "Não foi possível carregar os usuários mais ativos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopActiveUsers();
  }, [limit, toast]);

  return { users, loading, error };
};
