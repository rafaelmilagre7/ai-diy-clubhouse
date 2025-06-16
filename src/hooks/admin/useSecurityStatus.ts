
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
      
      console.log('🔍 [SECURITY] Verificando status após correção definitiva...');
      
      const { data, error } = await supabase.rpc('check_rls_status');
      
      if (error) {
        console.error('❌ [SECURITY] Erro ao verificar status:', error);
        setError(error.message);
        toast.error(`Erro ao verificar segurança: ${error.message}`);
        throw error;
      }
      
      console.log('✅ [SECURITY] Status verificado após correção:', data);
      setSecurityData(data || []);
      
      // Análise dos resultados após correção
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
      
      console.log('📊 [SECURITY] Resultado da correção definitiva:', {
        total: totalTables,
        seguras: secureTables.length,
        rlsDesabilitado: rlsDisabledTables.length,
        semProtecao: unprotectedTables.length,
        porcentagemSegura: totalTables > 0 ? Math.round((secureTables.length / totalTables) * 100) : 0
      });
      
      if (unprotectedTables.length === 0 && rlsDisabledTables.length === 0) {
        toast.success('🎉 PERFEITO! Correção RLS aplicada com sucesso - Todas as tabelas estão seguras!');
      } else if (unprotectedTables.length === 0) {
        toast.warning(`⚠️ Progresso: ${rlsDisabledTables.length} tabelas ainda com RLS desabilitado (mas protegidas)`);
      } else {
        toast.error(`🔴 Ainda restam ${unprotectedTables.length} tabelas críticas sem proteção`);
      }
      
      return data || [];
    } catch (error: any) {
      console.error('❌ [SECURITY] Erro na verificação pós-correção:', error);
      setError(error.message || 'Erro desconhecido');
      toast.error('Erro ao verificar status após correção');
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
