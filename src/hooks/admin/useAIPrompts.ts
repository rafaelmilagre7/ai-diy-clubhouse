import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AIPrompt {
  id: string;
  key: string;
  name: string;
  description: string | null;
  prompt_content: string;
  category: 'builder' | 'networking' | 'learning' | 'general';
  model: string;
  temperature: number | null;
  max_tokens: number | null;
  timeout_seconds: number;
  retry_attempts: number;
  response_format: any | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export const useAIPrompts = () => {
  const queryClient = useQueryClient();

  // Buscar todos os prompts
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as AIPrompt[];
    }
  });

  // Atualizar prompt
  const updatePrompt = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIPrompt> }) => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar prompt', {
        description: error.message
      });
    }
  });

  // Criar novo prompt
  const createPrompt = useMutation({
    mutationFn: async (newPrompt: Omit<AIPrompt, 'id' | 'version' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .insert(newPrompt)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar prompt', {
        description: error.message
      });
    }
  });

  // Buscar prompt específico por key
  const getPromptByKey = async (key: string): Promise<AIPrompt | null> => {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as AIPrompt;
  };

  return {
    prompts,
    isLoading,
    updatePrompt,
    createPrompt,
    getPromptByKey
  };
};
