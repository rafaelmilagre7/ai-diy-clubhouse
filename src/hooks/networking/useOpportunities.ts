import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers';

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  opportunity_type: 'parceria' | 'fornecedor' | 'cliente' | 'investimento' | 'outro';
  tags: string[];
  contact_preference: 'platform' | 'linkedin' | 'whatsapp' | 'email';
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    position: string | null;
    linkedin_url: string | null;
    whatsapp_number: string | null;
    email: string | null;
  };
}

interface UseOpportunitiesFilters {
  type?: string;
  searchQuery?: string;
  tags?: string[];
}

export const useOpportunities = (filters?: UseOpportunitiesFilters) => {
  return useQuery({
    queryKey: ['networking-opportunities', filters],
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
            position,
            linkedin_url,
            whatsapp_number,
            email
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'todos') {
        query = query.eq('opportunity_type', filters.type);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Opportunity[];
    },
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOpportunity: {
      title: string;
      description: string;
      opportunity_type: string;
      tags: string[];
      contact_preference: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('networking_opportunities')
        .insert([
          {
            ...newOpportunity,
            user_id: user.id,
          },
        ])
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            company_name,
            avatar_url,
            position,
            linkedin_url,
            whatsapp_number,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data as Opportunity;
    },
    onMutate: async (newOpportunity) => {
      await queryClient.cancelQueries({ queryKey: ['networking-opportunities'] });
      const previousOpportunities = queryClient.getQueryData<Opportunity[]>(['networking-opportunities']);

      if (previousOpportunities) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const tempOpportunity: Opportunity = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            title: newOpportunity.title,
            description: newOpportunity.description,
            opportunity_type: newOpportunity.opportunity_type as Opportunity['opportunity_type'],
            tags: newOpportunity.tags,
            contact_preference: newOpportunity.contact_preference as Opportunity['contact_preference'],
            is_active: true,
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: {
              id: user.id,
              name: user.email || 'Você',
              email: user.email || '',
              avatar_url: null,
              company_name: null,
              position: null,
              linkedin_url: null,
              whatsapp_number: null,
            },
          };

          queryClient.setQueryData<Opportunity[]>(
            ['networking-opportunities'],
            [tempOpportunity, ...previousOpportunities]
          );
        }
      }

      return { previousOpportunities };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-opportunities'] });
      showSuccessToast('🎉 Oportunidade criada!', 'Sua oportunidade está visível no mural');
    },
    onError: (error: any, _newOpportunity, context) => {
      if (context?.previousOpportunities) {
        queryClient.setQueryData(['networking-opportunities'], context.previousOpportunities);
      }
      showErrorToast('Erro ao criar oportunidade', error.message);
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Opportunity>;
    }) => {
      const { data, error } = await supabase
        .from('networking_opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-opportunities'] });
      showSuccessToast('Oportunidade atualizada', 'As informações foram atualizadas com sucesso');
    },
    onError: (error: any) => {
      showErrorToast('Erro ao atualizar oportunidade', error.message);
    },
  });
};

export const useDeleteOpportunity = () => {
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
      queryClient.invalidateQueries({ queryKey: ['networking-opportunities'] });
      showSuccessToast('Oportunidade removida', 'A oportunidade foi excluída do mural');
    },
    onError: (error: any) => {
      showErrorToast('Erro ao remover oportunidade', error.message);
    },
  });
};
