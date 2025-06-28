
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      console.log('🧹 [INVITE CLEANUP] Iniciando limpeza manual');
      
      // First, get count of expired invites
      const { data: expiredInvites, error: selectError } = await supabase
        .from('invites')
        .select('id, email')
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null);

      if (selectError) throw selectError;

      const expiredCount = expiredInvites?.length || 0;

      // Create backup in audit_logs before deleting
      if (expiredCount > 0 && expiredInvites) {
        // Log cleanup action
        await supabase
          .from('audit_logs')
          .insert({
            event_type: 'invite_cleanup',
            action: 'cleanup_expired_invites',
            user_id: (await supabase.auth.getUser()).data.user?.id || null,
            details: {
              expired_count: expiredCount,
              emails: expiredInvites.map(i => i.email),
              cleanup_reason: 'automated_cleanup',
              cleaned_at: new Date().toISOString()
            }
          });

        // Delete expired invites
        const { error: deleteError } = await supabase
          .from('invites')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .is('used_at', null);

        if (deleteError) throw deleteError;
      }

      const result: InviteCleanupStats = {
        expiredInvites: expiredCount,
        deletedInvites: expiredCount,
        cleanupTimestamp: new Date().toISOString()
      };

      setStats(result);
      
      // Toast based on result
      if (result.deletedInvites === 0) {
        toast.info('ℹ️ Nenhum convite expirado encontrado', {
          description: 'Todos os convites estão dentro do prazo válido',
          duration: 4000
        });
      } else {
        toast.success('✅ Limpeza de convites concluída!', {
          description: `${result.deletedInvites} convites expirados removidos`,
          duration: 6000
        });
      }

      console.log('✅ Limpeza de convites concluída:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro na limpeza de convites:', error);
      
      toast.error('❌ Erro na limpeza de convites', {
        description: error.message || 'Erro desconhecido',
        duration: 8000
      });
      
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
