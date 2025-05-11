
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface TrustedDomain {
  id: string;
  domain: string;
  role_id: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
  role?: {
    name: string;
  };
  creator?: {
    name: string;
    email: string;
  };
}

export function useTrustedDomains() {
  const [domains, setDomains] = useState<TrustedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar todos os domínios confiáveis
  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('trusted_domains')
        .select(`
          *,
          role:role_id(name),
          creator:created_by(name, email)
        `)
        .order('domain');
      
      if (error) throw error;
      
      setDomains(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar domínios confiáveis:', err);
      setError(err);
      toast.error('Erro ao carregar domínios confiáveis', {
        description: err.message || 'Não foi possível carregar a lista de domínios.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo domínio confiável
  const createDomain = useCallback(async (domain: string, roleId: string, description?: string) => {
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('trusted_domains')
        .insert({
          domain,
          role_id: roleId,
          description,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setDomains(prev => [...prev, data]);
      toast.success('Domínio confiável adicionado', {
        description: `O domínio ${domain} foi adicionado com sucesso.`
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
  }, []);

  // Atualizar domínio confiável
  const updateDomain = useCallback(async (id: string, updates: Partial<TrustedDomain>) => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('trusted_domains')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setDomains(prev => prev.map(domain => domain.id === id ? data : domain));
      toast.success('Domínio atualizado com sucesso');
      
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar domínio:', err);
      toast.error('Erro ao atualizar domínio', {
        description: err.message || 'Não foi possível atualizar o domínio confiável.'
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Excluir domínio confiável
  const deleteDomain = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('trusted_domains')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDomains(prev => prev.filter(domain => domain.id !== id));
      toast.success('Domínio removido com sucesso');
      
    } catch (err: any) {
      console.error('Erro ao excluir domínio:', err);
      toast.error('Erro ao remover domínio', {
        description: err.message || 'Não foi possível remover o domínio confiável.'
      });
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Alternar status ativo/inativo de um domínio
  const toggleDomainStatus = useCallback(async (id: string, currentStatus: boolean) => {
    return updateDomain(id, { is_active: !currentStatus });
  }, [updateDomain]);

  return {
    domains,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
    toggleDomainStatus
  };
}
