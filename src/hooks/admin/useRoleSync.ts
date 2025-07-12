
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
  const [hasHealthCheck, setHasHealthCheck] = useState(false);

  // Verificação de saúde do sistema antes de executar operações
  const checkSystemHealth = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_system_health');
      
      if (error) {
        console.warn('Sistema de saúde não disponível:', error.message);
        return false;
      }
      
      if (data?.database_status !== 'operational') {
        console.warn('Sistema de banco não está operacional');
        return false;
      }
      
      setHasHealthCheck(true);
      return true;
    } catch (error) {
      console.warn('Erro na verificação de saúde:', error);
      return false;
    }
  };

  const validateRoles = async () => {
    try {
      setIsLoading(true);
      
      // Verificar saúde do sistema primeiro
      const isHealthy = await checkSystemHealth();
      if (!isHealthy) {
        toast.warning('⚠️ Sistema instável - pulando validação automática');
        return [];
      }
      
      console.log('Iniciando validação de roles...');
      const { data, error } = await supabase.rpc('validate_profile_roles');
      
      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.code === 'PGRST116' || error.message.includes('function') || error.message.includes('does not exist')) {
          console.warn('Função validate_profile_roles não disponível:', error.message);
          toast.info('ℹ️ Funcionalidade de validação não está disponível no momento');
          return [];
        }
        
        if (error.message.includes('permission denied')) {
          console.warn('Sem permissão para validar roles:', error.message);
          toast.warning('⚠️ Sem permissão para executar validação');
          return [];
        }
        
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
    } catch (error: any) {
      // Não mostrar toast de erro para falhas silenciosas
      if (!error.message?.includes('permission denied') && !error.message?.includes('does not exist')) {
        console.error('Erro ao validar roles:', error);
        toast.error('Erro ao validar roles do sistema');
      }
      
      // Retornar array vazio em vez de propagar erro
      setIssues([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const auditRoles = async () => {
    try {
      setIsLoading(true);
      
      // Verificar saúde do sistema primeiro
      const isHealthy = await checkSystemHealth();
      if (!isHealthy) {
        toast.warning('⚠️ Sistema instável - pulando auditoria automática');
        return null;
      }
      
      console.log('Iniciando auditoria de roles...');
      const { data, error } = await supabase.rpc('audit_role_assignments');
      
      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.code === 'PGRST116' || error.message.includes('function') || error.message.includes('does not exist')) {
          console.warn('Função audit_role_assignments não disponível:', error.message);
          toast.info('ℹ️ Funcionalidade de auditoria não está disponível no momento');
          return null;
        }
        
        if (error.message.includes('permission denied')) {
          console.warn('Sem permissão para auditar roles:', error.message);
          toast.warning('⚠️ Sem permissão para executar auditoria');
          return null;
        }
        
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
    } catch (error: any) {
      // Não mostrar toast de erro para falhas silenciosas
      if (!error.message?.includes('permission denied') && !error.message?.includes('does not exist')) {
        console.error('Erro ao auditar roles:', error);
        toast.error('Erro ao executar auditoria do sistema');
      }
      
      // Retornar null em vez de propagar erro
      setAuditData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const syncRoles = async () => {
    try {
      setIsLoading(true);
      
      // Verificar saúde do sistema primeiro
      const isHealthy = await checkSystemHealth();
      if (!isHealthy) {
        toast.warning('⚠️ Sistema instável - não é seguro executar sincronização');
        return { success: false, total_profiles: 0, profiles_corrected: 0, message: 'Sistema instável' };
      }
      
      console.log('Iniciando sincronização de roles...');
      const { data, error } = await supabase.rpc('sync_profile_roles');
      
      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.code === 'PGRST116' || error.message.includes('function') || error.message.includes('does not exist')) {
          console.warn('Função sync_profile_roles não disponível:', error.message);
          toast.info('ℹ️ Funcionalidade de sincronização não está disponível no momento');
          return { success: false, total_profiles: 0, profiles_corrected: 0, message: 'Função não disponível' };
        }
        
        if (error.message.includes('permission denied')) {
          console.warn('Sem permissão para sincronizar roles:', error.message);
          toast.warning('⚠️ Sem permissão para executar sincronização');
          return { success: false, total_profiles: 0, profiles_corrected: 0, message: 'Sem permissão' };
        }
        
        console.error('Erro na sincronização de roles:', error);
        throw error;
      }
      
      console.log('Resultado da sincronização:', data);
      
      if (data) {
        toast.success(`🔄 ${data.message}`);
        
        // Revalidar após sincronização para atualizar dados
        console.log('Revalidando após sincronização...');
        try {
          await Promise.all([validateRoles(), auditRoles()]);
        } catch (revalidationError) {
          console.warn('Erro na revalidação pós-sincronização:', revalidationError);
          // Não propagar erro de revalidação
        }
      }
      
      return data as SyncResult;
    } catch (error: any) {
      // Não mostrar toast de erro para falhas silenciosas
      if (!error.message?.includes('permission denied') && !error.message?.includes('does not exist')) {
        console.error('Erro ao sincronizar roles:', error);
        toast.error('Erro ao sincronizar roles do sistema');
      }
      
      return { success: false, total_profiles: 0, profiles_corrected: 0, message: 'Erro na sincronização' };
    } finally {
      setIsLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    try {
      setIsLoading(true);
      
      // Verificar saúde do sistema primeiro
      const isHealthy = await checkSystemHealth();
      if (!isHealthy) {
        console.warn('Sistema não está saudável, executando diagnóstico limitado');
        toast.warning('⚠️ Executando diagnóstico limitado - sistema instável');
        return {
          audit: null,
          issues: [],
          hasIssues: false
        };
      }
      
      toast.info('🔍 Executando diagnóstico completo do sistema...');
      
      // Executar auditoria e validação em paralelo com tratamento de erro individual
      const results = await Promise.allSettled([
        auditRoles(),
        validateRoles()
      ]);
      
      const auditResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const validationResult = results[1].status === 'fulfilled' ? results[1].value : [];
      
      // Log dos erros se houver
      if (results[0].status === 'rejected') {
        console.warn('Auditoria falhou:', results[0].reason);
      }
      if (results[1].status === 'rejected') {
        console.warn('Validação falhou:', results[1].reason);
      }
      
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
    } catch (error: any) {
      console.error('Erro no diagnóstico completo:', error);
      
      // Não mostrar toast de erro se for problema de sistema não disponível
      if (!error.message?.includes('permission denied') && !error.message?.includes('does not exist')) {
        toast.error('Erro ao executar diagnóstico completo');
      }
      
      // Retornar estado seguro em vez de propagar erro
      return {
        audit: null,
        issues: [],
        hasIssues: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    issues,
    auditData,
    hasHealthCheck,
    validateRoles,
    auditRoles,
    syncRoles,
    runFullDiagnostic,
    checkSystemHealth
  };
};
