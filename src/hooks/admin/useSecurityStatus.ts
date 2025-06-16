
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
      
      console.log('🔍 [SECURITY] Verificando status final após correção definitiva...');
      
      const { data, error } = await supabase.rpc('check_rls_status');
      
      if (error) {
        console.error('❌ [SECURITY] Erro ao verificar status:', error);
        setError(error.message);
        toast.error(`Erro ao verificar segurança: ${error.message}`);
        throw error;
      }
      
      console.log('✅ [SECURITY] Status final verificado:', data);
      setSecurityData(data || []);
      
      // Análise detalhada dos resultados
      const totalTables = data?.length || 0;
      const secureTables = data?.filter(row => 
        row.security_status.includes('SEGURO')
      ) || [];
      const rlsDisabledTables = data?.filter(row => 
        row.security_status.includes('RLS DESABILITADO')
      ) || [];
      const unprotectedTables = data?.filter(row => 
        row.security_status.includes('SEM PROTEÇÃO')
      ) || [];
      
      console.log('📊 [SECURITY] Análise final:', {
        total: totalTables,
        seguras: secureTables.length,
        rlsDesabilitado: rlsDisabledTables.length,
        semProtecao: unprotectedTables.length
      });
      
      if (unprotectedTables.length > 0) {
        toast.error(
          `🔴 CRÍTICO: ${unprotectedTables.length} tabelas ainda sem proteção: ${unprotectedTables.map(t => t.table_name).join(', ')}`
        );
      } else if (rlsDisabledTables.length > 0) {
        toast.warning(
          `⚠️ ${rlsDisabledTables.length} tabelas com RLS desabilitado (mas com políticas)`
        );
      } else {
        toast.success('🎉 EXCELENTE! Todas as tabelas estão completamente seguras com RLS!');
      }
      
      // Log detalhado das tabelas problemáticas
      if (rlsDisabledTables.length > 0) {
        console.log('⚠️ [SECURITY] Tabelas com RLS desabilitado:', 
          rlsDisabledTables.map(t => t.table_name));
      }
      if (unprotectedTables.length > 0) {
        console.log('🔴 [SECURITY] Tabelas sem proteção:', 
          unprotectedTables.map(t => t.table_name));
      }
      
      return data || [];
    } catch (error: any) {
      console.error('❌ [SECURITY] Erro na verificação final:', error);
      setError(error.message || 'Erro desconhecido');
      toast.error('Erro ao verificar status final de segurança');
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
