
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Nova';
    case 'under_review':
      return 'Em Análise';
    case 'approved':
      return 'Aprovada';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'implemented':
      return 'Implementada';
    case 'rejected':
      return 'Rejeitada';
    default:
      return status;
  }
};

export const useAdminSuggestions = () => {
  const [loading, setLoading] = useState(false);

  const removeSuggestion = async (suggestionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[ADMIN-SUGGESTIONS] Removendo sugestão:', suggestionId);
      
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestionId as any);
      
      if (error) {
        console.error('[ADMIN-SUGGESTIONS] Erro ao remover sugestão:', error);
        toast.error('Erro ao remover sugestão: ' + error.message);
        return false;
      }
      
      console.log('[ADMIN-SUGGESTIONS] Sugestão removida com sucesso');
      return true;
    } catch (error: any) {
      console.error('[ADMIN-SUGGESTIONS] Erro não esperado ao remover sugestão:', error);
      toast.error('Erro ao remover sugestão: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[ADMIN-SUGGESTIONS] Atualizando status da sugestão:', suggestionId, 'para:', status);
      
      const { error } = await supabase
        .from('suggestions')
        .update({ status } as any)
        .eq('id', suggestionId as any);
      
      if (error) {
        console.error('[ADMIN-SUGGESTIONS] Erro ao atualizar status da sugestão:', error);
        toast.error('Erro ao atualizar status da sugestão: ' + error.message);
        return false;
      }
      
      const statusDisplayName = getStatusDisplayName(status);
      toast.success(`Sugestão marcada como "${statusDisplayName}" com sucesso`);
      console.log('[ADMIN-SUGGESTIONS] Status atualizado com sucesso');
      return true;
    } catch (error: any) {
      console.error('[ADMIN-SUGGESTIONS] Erro não esperado ao atualizar status da sugestão:', error);
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
