
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TrustedDomain } from "./types";

export const useTrustedDomainsList = () => {
  const [domains, setDomains] = useState<TrustedDomain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('trusted_domains')
        .select(`
          id,
          domain,
          role_id,
          description,
          is_active,
          created_at,
          role:user_roles(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDomains((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar domínios:', error);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return { domains, loading, fetchDomains };
};
