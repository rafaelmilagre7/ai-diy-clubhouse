
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  CommunityReport, 
  ModerationAction, 
  UserModerationStatus, 
  ModerationSettings, 
  ModerationStats 
} from '@/types/moderationTypes';

export const useModeration = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('community_reports')
        .update({ status } as any)
        .eq('id', reportId as any);

      if (error) throw error;

      const { data } = await supabase
        .from('community_reports')
        .select('*')
        .eq('id', reportId as any);

      setReports((data as any) || []);
      
      toast({
        title: "Status atualizado",
        description: "O status do relatório foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: suspendedUsers } = await supabase
        .from('user_moderation_status')
        .select('id')
        .eq('is_suspended', true as any)
        .eq('is_banned', false as any);

      const { data: pendingReports } = await supabase
        .from('community_reports')
        .select('id')
        .eq('status', 'pending' as any);
      
      const { data: resolvedReports } = await supabase
        .from('community_reports')
        .select('id')
        .eq('status', 'resolved' as any);

      setStats({
        total_reports: pendingReports?.length || 0 + resolvedReports?.length || 0,
        pending_reports: pendingReports?.length || 0,
        resolved_reports: resolvedReports?.length || 0,
        total_actions: 0,
        active_suspensions: suspendedUsers?.length || 0,
        total_bans: 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const createReport = async (reportData: Omit<CommunityReport, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('community_reports')
        .insert({
          ...reportData,
          reporter_id: user.user.id,
          status: 'pending'
        } as any);

      if (error) throw error;

      await fetchReports();
      
      toast({
        title: "Relatório criado",
        description: "Seu relatório foi enviado e será analisado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar relatório",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const performModerationAction = async (actionData: Omit<ModerationAction, 'id' | 'created_at' | 'moderator_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('moderation_actions')
        .insert({
          ...actionData,
          moderator_id: user.user.id
        } as any);

      if (error) throw error;

      await fetchActions();
      
      toast({
        title: "Ação executada",
        description: "A ação de moderação foi executada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao executar ação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchActions(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    reports,
    actions,
    stats,
    loading,
    createReport,
    updateReportStatus,
    performModerationAction,
    fetchReports,
    fetchActions,
    fetchStats
  };
};
