
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

export const useRoleSyncOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const validateRoles = async (): Promise<RoleIssue[]> => {
    try {
      setIsLoading(true);
      
      console.log('Iniciando validação de roles...');
      const { data, error } = await supabase.rpc('validate_profile_roles');
      
      if (error) {
        console.error('Erro na validação de roles:', error);
        throw error;
      }
      
      console.log('Resultado da validação:', data);
      const issues = (data as any) || [];
      
      const issueCount = issues.length;
      if (issueCount === 0) {
        toast.success('✅ Validação concluída: Nenhuma inconsistência encontrada!');
      } else {
        toast.warning(`⚠️ Validação concluída: ${issueCount} inconsistência(s) encontrada(s)`);
      }
      
      return issues;
    } catch (error) {
      console.error('Erro ao validar roles:', error);
      toast.error('Erro ao validar roles do sistema');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const auditRoles = async (): Promise<AuditResult | null> => {
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

  const syncRoles = async (): Promise<SyncResult | null> => {
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
        
        toast.success(`🔄 ${(data as any).message}`);
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

  return {
    isLoading,
    validateRoles,
    auditRoles,
    syncRoles
  };
};
