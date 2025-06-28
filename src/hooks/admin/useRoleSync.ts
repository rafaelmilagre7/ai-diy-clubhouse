
import { useState } from 'react';
import { useRoleSyncOperations } from './useRoleSyncOperations';
import { toast } from 'sonner';

interface RoleIssue {
  user_id: string;
  email: string;
  user_role: string;
  user_role_id: string;
  expected_role_name: string;
  expected_role_id: string;
  issue_type: string;
}

interface AuditResult {
  user_count_by_role: Record<string, number>;
  inconsistencies_count: number;
  total_users: number;
  roles_without_users: string[] | null;
  users_without_roles: number;
}

interface SyncResult {
  success: boolean;
  total_profiles: number;
  profiles_corrected: number;
  message: string;
  status: 'success' | 'error' | 'warning' | 'info';
}

export const useRoleSync = () => {
  const [issues, setIssues] = useState<RoleIssue[]>([]);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  
  const { isLoading, validateRoles, auditRoles, syncRoles } = useRoleSyncOperations();

  const handleValidateRoles = async () => {
    try {
      const result = await validateRoles();
      setIssues(result);
      return result;
    } catch (error) {
      console.error('Erro na validação:', error);
      throw error;
    }
  };

  const handleAuditRoles = async () => {
    try {
      const result = await auditRoles();
      setAuditData(result);
      return result;
    } catch (error) {
      console.error('Erro na auditoria:', error);
      throw error;
    }
  };

  const handleSyncRoles = async () => {
    try {
      const result = await syncRoles();
      if (result) {
        setSyncResults(prev => [...prev, result]);
        
        // Revalidar após sincronização
        console.log('Revalidando após sincronização...');
        await Promise.all([handleValidateRoles(), handleAuditRoles()]);
      }
      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  };

  const runFullDiagnostic = async () => {
    try {
      toast.info('🔍 Executando diagnóstico completo do sistema...');
      
      setSyncResults(prev => [...prev, {
        success: true,
        total_profiles: 0,
        profiles_corrected: 0,
        message: 'Iniciando diagnóstico completo...',
        status: 'info'
      }]);
      
      // Executar auditoria e validação em paralelo
      const [auditResult, validationResult] = await Promise.all([
        handleAuditRoles(),
        handleValidateRoles()
      ]);
      
      const hasIssues = validationResult.length > 0;
      
      if (hasIssues) {
        toast.warning(
          `⚠️ Diagnóstico concluído: ${validationResult.length} inconsistência(s) detectada(s)`
        );
      } else {
        toast.success('✅ Diagnóstico concluído: Sistema de roles está íntegro!');
      }
      
      return {
        audit: auditResult,
        issues: validationResult,
        hasIssues
      };
    } catch (error) {
      console.error('Erro no diagnóstico completo:', error);
      toast.error('Erro ao executar diagnóstico completo');
      throw error;
    }
  };

  const clearResults = () => {
    setSyncResults([]);
  };

  return {
    isLoading,
    issues,
    auditData,
    syncResults,
    validateRoles: handleValidateRoles,
    auditRoles: handleAuditRoles,
    syncRoles: handleSyncRoles,
    runFullDiagnostic,
    clearResults
  };
};
