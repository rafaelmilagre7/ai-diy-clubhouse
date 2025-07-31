
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Nova';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'implemented':
      return 'Implementada';
    case 'rejected':
      return 'Recusada';
    default:
      return status;
  }
};

export const useAdminSuggestions = () => {
  const [loading, setLoading] = useState(false);
  
  // Debug: Log para investigar estado de loading
  console.log('🔄 [USE-ADMIN-SUGGESTIONS] Estado loading:', loading);

  const removeSuggestion = async (suggestionId: string): Promise<boolean> => {
    try {
      console.log('🗑️ [REMOVE-SUGGESTION] Iniciando remoção:', suggestionId);
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
      console.log('📝 [UPDATE-STATUS] Iniciando atualização:', suggestionId, status);
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
      
      const statusDisplayName = getStatusDisplayName(status);
      toast.success(`Sugestão marcada como "${statusDisplayName}" com sucesso`);
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
