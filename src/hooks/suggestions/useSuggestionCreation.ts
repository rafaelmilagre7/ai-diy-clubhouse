
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SuggestionData {
  title: string;
  description: string;
  category_id: string;
}

export const useSuggestionCreation = () => {
  const { user } = useAuth();

  const submitSuggestion = async (data: SuggestionData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Criando sugestão:', data);

    const { data: suggestion, error } = await supabase
      .from('suggestions')
      .insert({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        user_id: user.id,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sugestão:', error);
      throw error;
    }

    console.log('Sugestão criada:', suggestion);
    return suggestion;
  };

  const mutation = useMutation({
    mutationFn: submitSuggestion,
  });

  return {
    submitSuggestion: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error
  };
};
