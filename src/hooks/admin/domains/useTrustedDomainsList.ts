
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TrustedDomain } from './types';

export function useTrustedDomainsList() {
  const [domains, setDomains] = useState<TrustedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  return {
    domains,
    loading,
    error,
    fetchDomains
  };
}
