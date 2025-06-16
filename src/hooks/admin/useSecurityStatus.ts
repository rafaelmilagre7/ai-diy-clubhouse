
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SecurityStatusRow {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
}

export const useSecurityStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [securityData, setSecurityData] = useState<SecurityStatusRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkSecurityStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [SECURITY] Verificando status de segurança RLS após correções...');
      
      const { data, error } = await supabase.rpc('check_rls_status');
      
      if (error) {
        console.error('❌ [SECURITY] Erro ao verificar status:', error);
        setError(error.message);
        toast.error(`Erro ao verificar segurança: ${error.message}`);
        throw error;
      }
      
      console.log('✅ [SECURITY] Status verificado após correções:', data);
      setSecurityData(data || []);
      
      // Contar problemas restantes
      const insecureTables = data?.filter(row => 
        row.security_status.includes('SEM PROTEÇÃO') || 
        row.security_status.includes('RLS DESABILITADO')
      );
      
      if (insecureTables && insecureTables.length > 0) {
        toast.warning(
          `⚠️ Ainda existem ${insecureTables.length} tabelas com problemas de segurança`
        );
        console.log('🔧 [SECURITY] Tabelas que ainda precisam de atenção:', 
          insecureTables.map(t => t.table_name));
      } else {
        toast.success('🔒 Excelente! Todas as tabelas estão protegidas com RLS');
        console.log('🎉 [SECURITY] Sistema completamente seguro!');
      }
      
      return data || [];
    } catch (error: any) {
      console.error('❌ [SECURITY] Erro ao verificar segurança:', error);
      setError(error.message || 'Erro desconhecido');
      toast.error('Erro ao verificar status de segurança');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    securityData,
    error,
    checkSecurityStatus
  };
};
