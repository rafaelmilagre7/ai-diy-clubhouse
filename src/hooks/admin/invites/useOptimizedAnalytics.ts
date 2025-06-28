
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizedAnalytics {
  period: string;
  invitesSent: number;
  acceptanceRate: number;
}

export const useOptimizedAnalytics = () => {
  const [analytics, setAnalytics] = useState<OptimizedAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get basic invite data from existing invites table
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('id, created_at, used_at')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      // Process data into periods (last 6 months)
      const periods: OptimizedAnalytics[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const periodInvites = (invites || []).filter(invite => {
          const createdAt = new Date(invite.created_at);
          return createdAt >= periodStart && createdAt <= periodEnd;
        });

        const usedInvites = periodInvites.filter(invite => invite.used_at);
        
        periods.push({
          period: periodStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          invitesSent: periodInvites.length,
          acceptanceRate: periodInvites.length > 0 ? (usedInvites.length / periodInvites.length) * 100 : 0
        });
      }

      setAnalytics(periods);

    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error);
      setError(error.message);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
