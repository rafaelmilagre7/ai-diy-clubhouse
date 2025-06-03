
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
      
      toast.success('Sugestão removida com sucesso');
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
      
      // Validar status - incluindo 'completed' que estava faltando
      const validStatuses = ['new', 'under_review', 'in_development', 'completed', 'declined'];
      if (!validStatuses.includes(status)) {
        console.error('Status inválido:', status);
        toast.error('Status inválido: ' + status);
        return false;
      }
      
      const { error } = await supabase
        .from('suggestions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestionId);
      
      if (error) {
        console.error('Erro ao atualizar status da sugestão:', error);
        toast.error('Erro ao atualizar status da sugestão: ' + error.message);
        return false;
      }
      
      // Mensagens de sucesso personalizadas
      const statusMessages = {
        'new': 'Sugestão marcada como nova',
        'under_review': 'Sugestão em análise',
        'in_development': 'Sugestão marcada como em desenvolvimento',
        'completed': 'Sugestão marcada como implementada! 🎉',
        'declined': 'Sugestão marcada como recusada'
      };
      
      toast.success(statusMessages[status as keyof typeof statusMessages] || `Status atualizado para ${status}`);
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
