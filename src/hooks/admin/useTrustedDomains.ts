
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
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
}

export function useTrustedDomains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<TrustedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Buscar todos os domínios confiáveis
  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('trusted_domains')
        .select(`
          *,
          role:role_id(name)
        `)
        .order('domain', { ascending: true });
      
      if (error) throw error;
      
      setDomains(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar domínios confiáveis:', err);
      setError(err);
      toast.error('Erro ao carregar domínios confiáveis', {
        description: err.message || 'Não foi possível carregar a lista de domínios confiáveis.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      await fetchDomains();
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
  }, [user, fetchDomains]);

  // Excluir domínio confiável
  const deleteDomain = useCallback(async (domainId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('trusted_domains')
        .delete()
        .eq('id', domainId);
      
      if (error) throw error;
      
      setDomains(prev => prev.filter(domain => domain.id !== domainId));
      toast.success('Domínio confiável removido com sucesso');
      
    } catch (err: any) {
      console.error('Erro ao excluir domínio confiável:', err);
      toast.error('Erro ao remover domínio', {
        description: err.message || 'Não foi possível remover o domínio confiável.'
      });
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Ativar/desativar domínio
  const toggleDomainStatus = useCallback(async (domainId: string, currentStatus: boolean) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('trusted_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId);
      
      if (error) throw error;
      
      setDomains(prev => prev.map(domain => 
        domain.id === domainId ? { ...domain, is_active: !currentStatus } : domain
      ));
      
      const statusMessage = currentStatus ? 'desativado' : 'ativado';
      toast.success(`Domínio ${statusMessage} com sucesso`);
      
    } catch (err: any) {
      console.error('Erro ao atualizar status do domínio:', err);
      toast.error('Erro ao atualizar domínio', {
        description: err.message || 'Não foi possível atualizar o status do domínio.'
      });
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    domains,
    loading,
    error,
    isCreating,
    isDeleting,
    isUpdating,
    fetchDomains,
    createDomain,
    deleteDomain,
    toggleDomainStatus
  };
}
