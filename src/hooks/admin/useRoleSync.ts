
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
      const { data, error } = await supabase.rpc('validate_profile_roles');
      
      if (error) throw error;
      
      setIssues(data || []);
      toast.success(`Validação concluída: ${data?.length || 0} inconsistências encontradas`);
      
      return data || [];
    } catch (error) {
      console.error('Erro ao validar roles:', error);
      toast.error('Erro ao validar roles');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const auditRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('audit_role_assignments');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAuditData(data[0]);
        toast.success('Auditoria de roles concluída');
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao auditar roles:', error);
      toast.error('Erro ao auditar roles');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('sync_profile_roles');
      
      if (error) throw error;
      
      if (data) {
        toast.success(data.message);
        // Revalidar após sincronização
        await validateRoles();
        await auditRoles();
      }
      
      return data as SyncResult;
    } catch (error) {
      console.error('Erro ao sincronizar roles:', error);
      toast.error('Erro ao sincronizar roles');
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
    syncRoles
  };
};
