
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AuditLogEntry {
  actionType: string;
  stepName?: string;
  dataSnapshot?: any;
  errorDetails?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const useAuditLog = () => {
  const logAction = useCallback(async (userId: string, entry: AuditLogEntry) => {
    try {
      // Capturar informações do navegador
      const userAgent = navigator.userAgent;
      const ipAddress = 'client'; // IP será capturado no backend

      await supabase
        .from('onboarding_audit_logs')
        .insert({
          user_id: userId,
          action_type: entry.actionType,
          step_name: entry.stepName,
          data_snapshot: entry.dataSnapshot,
          error_details: entry.errorDetails,
          ip_address: entry.ipAddress || ipAddress,
          user_agent: entry.userAgent || userAgent
        });

      console.log('📝 Log de auditoria registrado:', entry.actionType);
    } catch (error: any) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
      // Não propagar erro para não bloquear o fluxo principal
    }
  }, []);

  const getAuditLogs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao buscar logs de auditoria:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('❌ Exceção ao buscar logs de auditoria:', error);
      return [];
    }
  }, []);

  return {
    logAction,
    getAuditLogs
  };
};
