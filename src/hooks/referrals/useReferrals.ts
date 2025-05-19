
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import type { Referral, ReferralStats } from '@/lib/supabase/types';
import { toast } from 'sonner';

export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    pending: 0,
    completed: 0,
    conversion_rate: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Garantir que os dados têm o tipo correto antes de atualizar o estado
      setReferrals(data || []);
      
      // Calcular estatísticas
      if (data) {
        const total = data.length;
        const completed = data.filter(ref => ref.status === 'completed').length;
        const pending = data.filter(ref => ref.status === 'pending').length;
        
        setStats({
          total,
          pending,
          completed,
          conversion_rate: total > 0 ? (completed / total * 100) : 0
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar indicações:', error);
      toast.error('Erro ao carregar indicações', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [user]);

  return {
    referrals,
    stats,
    loading,
    refresh: fetchReferrals
  };
}
