
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useAdminSuggestions = () => {
  const [loading, setLoading] = useState(false);

  const removeSuggestion = async (suggestionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Removendo sugestão:', suggestionId);
      
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestionId);
      
      if (error) {
        console.error('Erro ao remover sugestão:', error);
        toast.error('Erro ao remover sugestão: ' + error.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro não esperado ao remover sugestão:', error);
      toast.error('Erro ao remover sugestão: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Atualizando status da sugestão:', suggestionId, status);
      
      const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId);
      
      if (error) {
        console.error('Erro ao atualizar status da sugestão:', error);
        toast.error('Erro ao atualizar status da sugestão: ' + error.message);
        return false;
      }
      
      toast.success(`Status da sugestão atualizado para ${status}`);
      return true;
    } catch (error: any) {
      console.error('Erro não esperado ao atualizar status da sugestão:', error);
      toast.error('Erro ao atualizar status da sugestão: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    removeSuggestion,
    updateSuggestionStatus
  };
};
