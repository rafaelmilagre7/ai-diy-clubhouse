
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useInviteDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  // Excluir convite
  const deleteInvite = useCallback(async (inviteId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      
      toast.success('Convite removido com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir convite:', err);
      toast.error('Erro ao remover convite', {
        description: err.message || 'Não foi possível remover o convite.'
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    deleteInvite
  };
}
