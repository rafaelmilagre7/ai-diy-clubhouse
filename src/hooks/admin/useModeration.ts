
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';
import { CommunityReport, ModerationAction } from '@/types/moderationTypes';

interface CreateReportData {
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  reason: string;
  description?: string;
  topic_id?: string;
  post_id?: string;
  reported_user_id?: string;
}

interface ModerationActionData {
  action_type: 'pin' | 'unpin' | 'lock' | 'unlock' | 'hide' | 'unhide' | 'delete' | 'move' | 'warn' | 'suspend' | 'ban' | 'unban';
  topic_id?: string;
  post_id?: string;
  target_user_id?: string;
  reason: string;
  details?: any;
  duration_hours?: number;
}

export const useModeration = (enabled: boolean = false) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const canModerate = hasPermission('community.moderate');
  
  // Só buscar reports se o usuário pode moderar E a query está habilitada
  const shouldFetchReports = enabled && canModerate && user?.id;

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError
  } = useQuery({
    queryKey: ['communityReports'],
    queryFn: async (): Promise<CommunityReport[]> => {
      if (!canModerate) return [];
      
      const { data, error } = await supabase
        .from('community_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(id, name, avatar_url),
          reported_user:profiles!reported_user_id(id, name, avatar_url),
          topic:forum_topics!topic_id(id, title),
          post:forum_posts!post_id(id, content)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar reports:', error);
        throw error;
      }

      return data || [];
    },
    enabled: shouldFetchReports,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const {
    data: moderationActions,
    isLoading: actionsLoading
  } = useQuery({
    queryKey: ['moderationActions'],
    queryFn: async (): Promise<ModerationAction[]> => {
      if (!canModerate) return [];
      
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:profiles!moderator_id(id, name, avatar_url),
          target_user:profiles!target_user_id(id, name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar ações de moderação:', error);
        throw error;
      }

      return data || [];
    },
    enabled: shouldFetchReports,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Mutation para criar report
  const createReportMutation = useMutation({
    mutationFn: async (reportData: CreateReportData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_reports')
        .insert({
          ...reportData,
          reporter_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Report enviado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['communityReports'] });
      setIsReportModalOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao criar report:', error);
      toast.error('Erro ao enviar report');
    }
  });

  // Mutation para ação de moderação
  const moderationActionMutation = useMutation({
    mutationFn: async (actionData: ModerationActionData) => {
      if (!user?.id || !canModerate) {
        throw new Error('Usuário não autorizado');
      }

      const { data, error } = await supabase
        .from('moderation_actions')
        .insert({
          ...actionData,
          moderator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Ação de moderação executada');
      queryClient.invalidateQueries({ queryKey: ['moderationActions'] });
      queryClient.invalidateQueries({ queryKey: ['communityReports'] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
    },
    onError: (error) => {
      console.error('Erro na ação de moderação:', error);
      toast.error('Erro ao executar ação de moderação');
    }
  });

  return {
    // Estados
    canModerate,
    isReportModalOpen,
    setIsReportModalOpen,
    
    // Dados (só carregam se necessário)
    reports: shouldFetchReports ? reports : [],
    moderationActions: shouldFetchReports ? moderationActions : [],
    
    // Loading states
    reportsLoading: shouldFetchReports ? reportsLoading : false,
    actionsLoading: shouldFetchReports ? actionsLoading : false,
    reportsError: shouldFetchReports ? reportsError : null,
    
    // Actions
    createReport: createReportMutation.mutateAsync,
    performModerationAction: moderationActionMutation.mutateAsync,
    
    // Loading states para mutations
    isCreatingReport: createReportMutation.isPending,
    isPerformingAction: moderationActionMutation.isPending
  };
};
