
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
}

export const useRoleSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState<RoleIssue[]>([]);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

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
      setIssues(data || []);
      
      const issueCount = data?.length || 0;
      if (issueCount === 0) {
        toast.success('✅ Validação concluída: Nenhuma inconsistência encontrada!');
      } else {
        toast.warning(`⚠️ Validação concluída: ${issueCount} inconsistência(s) encontrada(s)`);
      }
      
      return data || [];
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
      
      if (data) {
        // A função agora retorna JSONB diretamente
        setAuditData(data);
        toast.success('📊 Auditoria de roles concluída com sucesso');
        return data;
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
        toast.success(`🔄 ${data.message}`);
        
        // Revalidar após sincronização para atualizar dados
        console.log('Revalidando após sincronização...');
        await Promise.all([validateRoles(), auditRoles()]);
      }
      
      return data as SyncResult;
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
      
      // Executar auditoria e validação em paralelo
      const [auditResult, validationResult] = await Promise.all([
        auditRoles(),
        validateRoles()
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    issues,
    auditData,
    validateRoles,
    auditRoles,
    syncRoles,
    runFullDiagnostic
  };
};
