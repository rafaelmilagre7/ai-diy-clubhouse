
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Suggestion } from '@/types/suggestionTypes';

export const useAdminSuggestions = () => {
  const [loading, setLoading] = useState(false);

  const removeSuggestion = async (suggestionId: string) => {
    try {
      setLoading(true);
      console.log('Removendo sugestão:', suggestionId);
      
      // Primeiro removemos os votos associados à sugestão
      const { error: votesError } = await supabase
        .from('suggestion_votes')
        .delete()
        .eq('suggestion_id', suggestionId);
      
      if (votesError) {
        console.error('Erro ao remover votos da sugestão:', votesError);
      }
      
      // Depois removemos os comentários associados à sugestão
      const { error: commentsError } = await supabase
        .from('suggestion_comments')
        .delete()
        .eq('suggestion_id', suggestionId);
      
      if (commentsError) {
        console.error('Erro ao remover comentários da sugestão:', commentsError);
      }
      
      // Por fim, removemos a sugestão
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) throw error;

      // Garantir que o loading state é liberado mesmo em caso de sucesso
      setLoading(false);
      
      // Restaurar o pointer-events para garantir que a interface continue responsiva
      document.body.style.pointerEvents = 'auto';
      
      return true;
    } catch (error: any) {
      console.error('Erro ao remover sugestão:', error);
      toast.error('Não foi possível remover a sugestão');
      
      // Garantir que o loading state é liberado mesmo em caso de erro
      setLoading(false);
      
      // Restaurar o pointer-events para garantir que a interface continue responsiva
      document.body.style.pointerEvents = 'auto';
      
      return false;
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: string) => {
    try {
      setLoading(true);
      console.log('Atualizando status da sugestão:', suggestionId, status);
      
      const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar status da sugestão:', error);
      toast.error('Não foi possível atualizar o status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    removeSuggestion,
    updateSuggestionStatus,
    loading
  };
};
