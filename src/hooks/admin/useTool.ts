
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '@/types/toolTypes';
import { toast } from 'sonner';

export const useTool = (toolId?: string) => {
  const queryClient = useQueryClient();

  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: async (): Promise<Tool | null> => {
      if (!toolId) return null;

      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;

      // Transform the data to match Tool interface
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        url: data.url,
        logo_url: data.logo_url,
        pricing_info: data.pricing_info,
        features: data.features,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        benefit_active: Boolean(data.benefit_active), // Convert string to boolean properly
        benefit_type: data.benefit_type,
        benefit_description: data.benefit_description,
        benefit_instructions: data.benefit_instructions,
        // Handle missing properties safely
        benefit_link: data.benefit_link || null,
        benefit_discount_percentage: data.benefit_discount_percentage || null,
      };
    },
    enabled: !!toolId
  });

  const updateTool = useMutation({
    mutationFn: async (updates: Partial<Tool>) => {
      if (!toolId) throw new Error('Tool ID is required');

      const { data, error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', toolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool', toolId] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('Ferramenta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar ferramenta:', error);
      toast.error('Erro ao atualizar ferramenta');
    }
  });

  return {
    tool,
    isLoading,
    error,
    updateTool: updateTool.mutate,
    isUpdating: updateTool.isPending
  };
};
