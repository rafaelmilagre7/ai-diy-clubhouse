import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Opportunity } from '@/hooks/networking/useOpportunities';

interface AdminOpportunitiesFilters {
  type?: string;
  status?: 'active' | 'inactive' | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export const useAdminOpportunities = (filters?: AdminOpportunitiesFilters) => {
  return useQuery({
    queryKey: ['admin-opportunities', filters],
    queryFn: async () => {
      let query = supabase
        .from('networking_opportunities')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            company_name,
            avatar_url,
            email,
            current_position
          )
        `)
        .order('created_at', { ascending: false });

      // Filtro de status
      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }

      // Filtro de tipo
      if (filters?.type && filters.type !== 'todos') {
        query = query.eq('opportunity_type', filters.type);
      }

      // Filtro de busca
      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      // Filtro de data
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Opportunity[];
    },
  });
};

export const useAdminOpportunitiesMetrics = () => {
  return useQuery({
    queryKey: ['admin-opportunities-metrics'],
    queryFn: async () => {
      const { data: allOpportunities, error: allError } = await supabase
        .from('networking_opportunities')
        .select('id, opportunity_type, created_at, updated_at, views_count, is_active');

      if (allError) throw allError;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = allOpportunities?.length || 0;
      const active = allOpportunities?.filter((o) => o.is_active).length || 0;
      const thisWeek = allOpportunities?.filter(
        (o) => new Date(o.created_at) >= weekAgo
      ).length || 0;
      const totalViews = allOpportunities?.reduce((sum, o) => sum + (o.views_count || 0), 0) || 0;
      
      // Contar editadas (diferença entre updated_at e created_at > 1 segundo)
      const edited = allOpportunities?.filter((o) => {
        const updated = new Date(o.updated_at || o.created_at);
        const created = new Date(o.created_at);
        return updated.getTime() - created.getTime() > 1000;
      }).length || 0;

      // Deletadas viriam de audit logs (não implementado agora)
      const deleted = 0;

      // Contagem por tipo
      const byType = allOpportunities?.reduce((acc, o) => {
        acc[o.opportunity_type] = (acc[o.opportunity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Timeline dos últimos 30 dias
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const timeline = allOpportunities
        ?.filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
        .reduce((acc, o) => {
          const date = new Date(o.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      return {
        total,
        active,
        inactive: total - active,
        thisWeek,
        totalViews,
        averageViews: total > 0 ? Math.round(totalViews / total) : 0,
        edited,
        deleted,
        byType: byType || {},
        timeline: timeline || {},
      };
    },
  });
};

export const useAdminToggleOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('networking_opportunities')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities-metrics'] });
      toast({
        title: variables.isActive ? 'Oportunidade ativada' : 'Oportunidade desativada',
        description: 'O status foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useAdminDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('networking_opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities-metrics'] });
      toast({
        title: 'Oportunidade deletada',
        description: 'A oportunidade foi removida permanentemente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
