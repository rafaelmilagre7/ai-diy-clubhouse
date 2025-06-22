
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
      
      console.log('🧹 [INVITE CLEANUP] Iniciando limpeza com backup automático');
      
      // Usar a nova função SQL aprimorada
      const { data, error } = await supabase.rpc('cleanup_expired_invites_enhanced');

      if (error) {
        console.error('❌ Erro na limpeza de convites:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Resposta vazia da função de limpeza');
      }

      console.log('📋 Resultado da limpeza:', data);

      if (!data.success) {
        throw new Error(data.message || 'Erro na limpeza de convites');
      }

      const result: InviteCleanupStats = {
        expiredInvites: data.expired_invites || 0,
        deletedInvites: data.deleted_invites || 0,
        cleanupTimestamp: data.cleanup_timestamp || new Date().toISOString()
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
