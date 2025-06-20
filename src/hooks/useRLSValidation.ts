
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RLSStatus {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
}

export const useRLSValidation = () => {
  const [rlsStatus, setRlsStatus] = useState<RLSStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRLSStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: rlsError } = await supabase.rpc('check_rls_status');
      
      if (rlsError) {
        throw new Error(rlsError.message);
      }
      
      setRlsStatus((data as any) || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao verificar status RLS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCompleteRLSSecurity = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_complete_rls_security');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return ((data as any) || []).map((item: any) => ({
        table_name: item.table_name,
        issue_type: item.issue_type,
        description: item.description,
        severity: item.severity,
        recommendation: item.recommendation
      }));
    } catch (err: any) {
      console.error('Erro ao validar segurança RLS completa:', err);
      return [];
    }
  };

  useEffect(() => {
    checkRLSStatus();
  }, []);

  return {
    rlsStatus,
    isLoading,
    error,
    checkRLSStatus,
    validateCompleteRLSSecurity
  };
};
