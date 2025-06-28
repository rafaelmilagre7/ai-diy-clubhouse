
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  topic_id?: string;
  post_id?: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export const useModeration = () => {
  const { isAdmin } = useSimpleAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!isAdmin) {
      setError('Acesso negado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Como a tabela community_reports não existe, vamos simular dados
      // baseados em dados reais do fórum
      const { data: forumPosts, error: postsError } = await supabase
        .from('forum_posts')
        .select('id, user_id, topic_id, created_at')
        .limit(10);

      if (postsError) throw postsError;

      // Simular relatórios de moderação
      const simulatedReports: ModerationReport[] = (forumPosts || []).slice(0, 5).map((post, index) => ({
        id: `report-${post.id}`,
        reporter_id: post.user_id,
        reported_user_id: post.user_id,
        topic_id: post.topic_id,
        post_id: post.id,
        reason: ['spam', 'inappropriate', 'harassment'][index % 3],
        description: 'Relatório simulado para demonstração',
        status: ['pending', 'reviewed', 'resolved'][index % 3],
        created_at: post.created_at,
        reviewed_at: index % 2 === 0 ? new Date().toISOString() : undefined,
        reviewed_by: index % 2 === 0 ? post.user_id : undefined
      }));

      setReports(simulatedReports);

    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      setError(error.message || 'Erro ao carregar relatórios de moderação');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      // Simular atualização de status
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status, reviewed_at: new Date().toISOString() }
          : report
      ));
      
      console.log(`Status do relatório ${reportId} atualizado para: ${status}`);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [isAdmin]);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    updateReportStatus
  };
};
