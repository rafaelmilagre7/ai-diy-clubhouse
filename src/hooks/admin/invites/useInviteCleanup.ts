
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
      
      console.log('🧹 [INVITE CLEANUP] Iniciando limpeza manual');
      
      // Buscar convites expirados
      const { data: expiredInvites, error: selectError } = await supabase
        .from('invites')
        .select('id, email')
        .lt('expires_at', new Date().toISOString())
        .is('used_at', null);

      if (selectError) throw selectError;

      const expiredCount = expiredInvites?.length || 0;

      // Criar backup antes de deletar
      if (expiredCount > 0) {
        const { error: backupError } = await supabase
          .from('invite_backups')
          .insert(
            expiredInvites.map(invite => ({
              original_invite_id: invite.id,
              email: invite.email,
              backup_reason: 'cleanup_expired',
              backup_data: { cleaned_at: new Date().toISOString() }
            }))
          );

        if (backupError) {
          console.warn('Erro ao criar backup:', backupError);
        }

        // Deletar convites expirados
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
      
      // Toast baseado no resultado
      if (result.deletedInvites === 0) {
        toast.info('ℹ️ Nenhum convite expirado encontrado', {
          description: 'Todos os convites estão dentro do prazo válido',
          duration: 4000
        });
      } else {
        toast.success('✅ Limpeza de convites concluída!', {
          description: `${result.deletedInvites} convites expirados removidos com backup automático`,
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
