
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToastModern } from '@/hooks/useToastModern';
import { CommunityReport } from '@/lib/supabase/types/implementation';

export const useCommunityReports = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastModern();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('community_reports')
        .select('*')
        .eq('reporter_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReports(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar relatórios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Omit<CommunityReport, 'id' | 'reporter_id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .insert({
          reporter_id: user?.id,
          ...reportData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      
      showSuccess('Relatório enviado', 'Seu relatório foi enviado e será analisado pela equipe.');

      return data;
    } catch (err: any) {
      console.error('Erro ao criar relatório:', err);
      showError('Erro', 'Não foi possível enviar o relatório.');
      throw err;
    }
  };

  return {
    reports,
    loading,
    error,
    createReport,
    refetch: fetchReports,
  };
};
