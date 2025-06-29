
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTrustedDomainDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  // Excluir domínio confiável
  const deleteDomain = useCallback(async (domainId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('trusted_domains')
        .delete()
        .eq('id', domainId);
      
      if (error) throw error;
      
      toast.success('Domínio confiável removido com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir domínio confiável:', err);
      toast.error('Erro ao remover domínio', {
        description: err.message || 'Não foi possível remover o domínio confiável.'
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    deleteDomain
  };
}
