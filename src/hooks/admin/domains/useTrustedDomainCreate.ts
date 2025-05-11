
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useTrustedDomainCreate() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Criar novo domínio confiável
  const createDomain = useCallback(async (domain: string, roleId: string, description?: string) => {
    if (!user) return null;
    
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('trusted_domains')
        .insert({
          domain,
          role_id: roleId,
          description,
          created_by: user.id,
          is_active: true
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast.success('Domínio confiável adicionado com sucesso', {
        description: `O domínio ${domain} foi adicionado à lista de domínios confiáveis.`
      });
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar domínio confiável:', err);
      toast.error('Erro ao adicionar domínio', {
        description: err.message || 'Não foi possível adicionar o domínio confiável.'
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  return {
    isCreating,
    createDomain
  };
}
