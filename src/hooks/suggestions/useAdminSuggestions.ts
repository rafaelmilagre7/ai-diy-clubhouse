
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Suggestion } from '@/types/suggestionTypes';

export const useAdminSuggestions = () => {
  const [loading, setLoading] = useState(false);

  const removeSuggestion = async (suggestionId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) throw error;

      toast.success('Sugestão removida com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover sugestão:', error);
      toast.error('Não foi possível remover a sugestão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId);

      if (error) throw error;

      toast.success(`Sugestão marcada como ${status}`);
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
