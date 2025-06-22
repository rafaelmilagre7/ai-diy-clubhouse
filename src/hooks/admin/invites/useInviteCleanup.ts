
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface InviteCleanupStats {
  expiredInvites: number;
  deletedInvites: number;
  cleanupTimestamp: string;
}

export const useInviteCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<InviteCleanupStats | null>(null);

  const cleanupExpiredInvites = useCallback(async (): Promise<InviteCleanupStats> => {
    try {
      setIsLoading(true);
      
      console.log('🧹 [INVITE CLEANUP] Iniciando limpeza de convites expirados');
      
      // 1. Buscar convites expirados
      const { data: expiredInvites, error: fetchError } = await supabase
        .from('invites')
        .select('id, email, expires_at')
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null);

      if (fetchError) {
        console.error('❌ Erro ao buscar convites expirados:', fetchError);
        throw fetchError;
      }

      const expiredCount = expiredInvites?.length || 0;
      console.log(`📊 Encontrados ${expiredCount} convites expirados`);

      if (expiredCount === 0) {
        const result: InviteCleanupStats = {
          expiredInvites: 0,
          deletedInvites: 0,
          cleanupTimestamp: new Date().toISOString()
        };
        setStats(result);
        return result;
      }

      // 2. Fazer backup dos convites antes de excluir
      const { error: backupError } = await supabase
        .from('invite_backups')
        .insert(
          expiredInvites.map(invite => ({
            original_invite_id: invite.id,
            email: invite.email,
            backup_reason: 'expired_cleanup',
            backup_data: invite
          }))
        );

      if (backupError) {
        console.warn('⚠️ Erro ao fazer backup dos convites:', backupError);
        // Continuar mesmo com erro no backup
      }

      // 3. Excluir convites expirados
      const { error: deleteError } = await supabase
        .from('invites')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null);

      if (deleteError) {
        console.error('❌ Erro ao excluir convites expirados:', deleteError);
        throw deleteError;
      }

      // 4. Registrar no log de auditoria
      await supabase
        .from('audit_logs')
        .insert({
          event_type: 'admin_action',
          action: 'cleanup_expired_invites',
          details: {
            expired_count: expiredCount,
            cleanup_timestamp: new Date().toISOString()
          }
        });

      const result: InviteCleanupStats = {
        expiredInvites: expiredCount,
        deletedInvites: expiredCount,
        cleanupTimestamp: new Date().toISOString()
      };

      setStats(result);
      console.log('✅ Limpeza de convites concluída:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro na limpeza de convites:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetStats = useCallback(() => {
    setStats(null);
  }, []);

  return {
    cleanupExpiredInvites,
    isLoading,
    stats,
    resetStats
  };
};
