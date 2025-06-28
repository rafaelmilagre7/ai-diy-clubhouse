
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

      // Transform the data to match Tool interface with proper type casting
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category as any, // Cast to avoid category type issues
        link: data.url, // Map url to link
        logo_url: data.logo_url,
        pricing_info: data.pricing_info,
        features: data.features,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        benefit_active: Boolean(data.benefit_title), // Use benefit_title existence as active flag
        benefit_type: (data.benefit_type as any) || 'discount', // Cast to avoid type issues
        benefit_description: data.benefit_description,
        benefit_instructions: data.benefit_title || null, // Map available field
        benefit_link: data.benefit_url || null,
        benefit_discount_percentage: data.benefit_url ? 10 : null, // Mock percentage based on benefit_url
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
