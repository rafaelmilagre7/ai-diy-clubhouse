
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CommunityReport, ModerationAction, UserModerationStatus, ModerationStats } from '@/types/moderationTypes';

export const useModeration = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const fetchReports = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('community_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(id, name, avatar_url),
          reported_user:profiles!reported_user_id(id, name, avatar_url),
          topic:forum_topics(id, title),
          post:forum_posts(id, content)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:profiles!moderator_id(id, name, avatar_url),
          target_user:profiles!target_user_id(id, name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
      toast.error('Erro ao carregar ações de moderação');
    }
  };

  const fetchStats = async () => {
    try {
      const [reportsRes, actionsRes, suspensionsRes, bansRes] = await Promise.all([
        supabase.from('community_reports').select('*', { count: 'exact', head: true }),
        supabase.from('moderation_actions').select('*', { count: 'exact', head: true }),
        supabase.from('user_moderation_status').select('*', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('user_moderation_status').select('*', { count: 'exact', head: true }).eq('is_banned', true)
      ]);

      const [pendingReportsRes, resolvedReportsRes] = await Promise.all([
        supabase.from('community_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('community_reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
      ]);

      setStats({
        total_reports: reportsRes.count || 0,
        pending_reports: pendingReportsRes.count || 0,
        resolved_reports: resolvedReportsRes.count || 0,
        total_actions: actionsRes.count || 0,
        active_suspensions: suspensionsRes.count || 0,
        total_bans: bansRes.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createReport = async (reportData: Partial<CommunityReport>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_reports')
        .insert([{
          ...reportData,
          reporter_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Relatório enviado com sucesso');
      await fetchReports();
      return data;
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      toast.error('Erro ao enviar relatório');
      throw error;
    }
  };

  const updateReportStatus = async (reportId: string, status: string, resolutionNotes?: string) => {
    try {
      setIsActing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('community_reports')
        .update({
          status,
          resolution_notes: resolutionNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Status do relatório atualizado');
      await fetchReports();
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      toast.error('Erro ao atualizar relatório');
    } finally {
      setIsActing(false);
    }
  };

  const performModerationAction = async (actionData: Partial<ModerationAction>) => {
    try {
      setIsActing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Registrar a ação
      const { error: actionError } = await supabase
        .from('moderation_actions')
        .insert([{
          ...actionData,
          moderator_id: user.id
        }]);

      if (actionError) throw actionError;

      // Executar a ação específica
      await executeAction(actionData);
      
      toast.success('Ação de moderação executada com sucesso');
      await Promise.all([fetchActions(), fetchStats()]);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast.error('Erro ao executar ação de moderação');
    } finally {
      setIsActing(false);
    }
  };

  const executeAction = async (actionData: Partial<ModerationAction>) => {
    const { action_type, topic_id, post_id, target_user_id, duration_hours } = actionData;

    switch (action_type) {
      case 'pin':
      case 'unpin':
        if (topic_id) {
          await supabase
            .from('forum_topics')
            .update({ is_pinned: action_type === 'pin' })
            .eq('id', topic_id);
        }
        break;
      
      case 'lock':
      case 'unlock':
        if (topic_id) {
          await supabase
            .from('forum_topics')
            .update({ is_locked: action_type === 'lock' })
            .eq('id', topic_id);
        }
        break;
      
      case 'hide':
      case 'unhide':
        if (post_id) {
          await supabase
            .from('forum_posts')
            .update({ is_hidden: action_type === 'hide' })
            .eq('id', post_id);
        }
        break;
      
      case 'suspend':
      case 'ban':
        if (target_user_id) {
          const suspendedUntil = duration_hours 
            ? new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString()
            : null;

          await supabase
            .from('user_moderation_status')
            .upsert({
              user_id: target_user_id,
              is_suspended: action_type === 'suspend',
              is_banned: action_type === 'ban',
              suspended_until: action_type === 'suspend' ? suspendedUntil : null,
              suspension_reason: action_type === 'suspend' ? actionData.reason : null,
              ban_reason: action_type === 'ban' ? actionData.reason : null
            });
        }
        break;
      
      case 'delete':
        if (topic_id) {
          await supabase.from('forum_topics').delete().eq('id', topic_id);
        } else if (post_id) {
          await supabase.from('forum_posts').delete().eq('id', post_id);
        }
        break;
    }
  };

  const bulkModerationAction = async (itemIds: string[], action: string, reason: string) => {
    try {
      setIsActing(true);
      
      for (const itemId of itemIds) {
        await performModerationAction({
          topic_id: itemId, // Assumindo que são tópicos
          action_type: action as any,
          reason
        });
      }
      
      toast.success(`Ação em lote executada em ${itemIds.length} itens`);
    } catch (error) {
      console.error('Erro na ação em lote:', error);
      toast.error('Erro ao executar ação em lote');
    } finally {
      setIsActing(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchActions();
    fetchStats();
  }, []);

  return {
    reports,
    actions,
    stats,
    loading,
    isActing,
    fetchReports,
    fetchActions,
    createReport,
    updateReportStatus,
    performModerationAction,
    bulkModerationAction,
    refetch: () => Promise.all([fetchReports(), fetchActions(), fetchStats()])
  };
};
