
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SuggestionData {
  title: string;
  description: string;
  category_id: string;
}

export const useSuggestionCreation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitSuggestion = async (data: SuggestionData) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('suggestions')
      .insert({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        user_id: user.id,
        status: 'new'
      });

    if (error) throw error;
  };

  const mutation = useMutation({
    mutationFn: submitSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    }
  });

  return {
    submitSuggestion: mutation.mutateAsync,
    isSubmitting: mutation.isPending
  };
};
