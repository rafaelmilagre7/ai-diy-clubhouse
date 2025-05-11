
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTrustedDomainToggle() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Ativar/desativar domínio
  const toggleDomainStatus = useCallback(async (domainId: string, currentStatus: boolean) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('trusted_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId);
      
      if (error) throw error;
      
      const statusMessage = currentStatus ? 'desativado' : 'ativado';
      toast.success(`Domínio ${statusMessage} com sucesso`);
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar status do domínio:', err);
      toast.error('Erro ao atualizar domínio', {
        description: err.message || 'Não foi possível atualizar o status do domínio.'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    toggleDomainStatus
  };
}
