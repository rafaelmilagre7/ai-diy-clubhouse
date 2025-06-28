
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState<RoleIssue[]>([]);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);

  const validateRoles = async () => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando validação de roles...');
      const { data, error } = await supabase.rpc('validate_profile_roles');
      
      if (error) {
        console.error('Erro na validação de roles:', error);
        throw error;
      }
      
      console.log('Resultado da validação:', data);
      setIssues((data as any) || []);
      
      const issueCount = (data as any)?.length || 0;
      if (issueCount === 0) {
        toast.success('✅ Validação concluída: Nenhuma inconsistência encontrada!');
      } else {
        toast.warning(`⚠️ Validação concluída: ${issueCount} inconsistência(s) encontrada(s)`);
      }
      
      return (data as any) || [];
    } catch (error) {
      console.error('Erro ao validar roles:', error);
      toast.error('Erro ao validar roles do sistema');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const auditRoles = async () => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando auditoria de roles...');
      const { data, error } = await supabase.rpc('audit_role_assignments');
      
      if (error) {
        console.error('Erro na auditoria de roles:', error);
        throw error;
      }
      
      console.log('Resultado da auditoria:', data);
      
      if (data && (data as any).length > 0) {
        const auditResult = (data as any)[0];
        setAuditData(auditResult);
        toast.success('📊 Auditoria de roles concluída com sucesso');
        return auditResult;
      }
      
      toast.info('Auditoria executada, mas nenhum dado retornado');
      return null;
    } catch (error) {
      console.error('Erro ao auditar roles:', error);
      toast.error('Erro ao executar auditoria do sistema');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncRoles = async () => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando sincronização de roles...');
      const { data, error } = await supabase.rpc('sync_profile_roles');
      
      if (error) {
        console.error('Erro na sincronização de roles:', error);
        throw error;
      }
      
      console.log('Resultado da sincronização:', data);
      
      if (data) {
        const result: SyncResult = {
          ...(data as any),
          status: 'success'
        };
        
        setSyncResults(prev => [...prev, result]);
        toast.success(`🔄 ${(data as any).message}`);
        
        // Revalidar após sincronização para atualizar dados
        console.log('Revalidando após sincronização...');
        await Promise.all([validateRoles(), auditRoles()]);
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao sincronizar roles:', error);
      toast.error('Erro ao sincronizar roles do sistema');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    try {
      setIsLoading(true);
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
        auditRoles(),
        validateRoles()
      ]);
      
      const hasIssues = (validationResult as any).length > 0;
      
      if (hasIssues) {
        toast.warning(
          `⚠️ Diagnóstico concluído: ${(validationResult as any).length} inconsistência(s) detectada(s)`
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
    } finally {
      setIsLoading(false);
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
    validateRoles,
    auditRoles,
    syncRoles,
    runFullDiagnostic,
    clearResults
  };
};
