import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-opportunities'] });
      toast({
        title: 'Oportunidade criada! 🎉',
        description: 'Sua oportunidade foi publicada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar oportunidade',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: 'Oportunidade atualizada',
        description: 'As alterações foram salvas.',
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
      toast({
        title: 'Oportunidade removida',
        description: 'A oportunidade foi deletada com sucesso.',
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
