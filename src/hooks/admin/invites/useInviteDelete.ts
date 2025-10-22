
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useInviteDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  // ⚡ SOFT DELETE OTIMIZADO - Exclusão instantânea com background cleanup
  const deleteInvite = useCallback(async (inviteId: string, inviteEmail?: string) => {
    const startTime = performance.now();
    
    try {
      setIsDeleting(true);
      
      // 🚀 SOFT DELETE - Usa função otimizada do banco
      const { data, error } = await supabase.rpc('soft_delete_invite_fast', {
        p_invite_id: inviteId
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      const totalTime = Math.round(performance.now() - startTime);
      
      // 🎯 TOAST OTIMIZADO - Feedback instantâneo com métricas
      toast.success('🗑️ Convite removido com sucesso!', {
        description: `✅ ${data.email} (${totalTime}ms) - Limpeza física em 24h`,
        duration: 4000
      });
      
      return true;
    } catch (err: any) {
      const totalTime = Math.round(performance.now() - startTime);
      console.error('❌ Erro ao excluir convite:', err, `(${totalTime}ms)`);
      
      toast.error('❌ Erro ao remover convite', {
        description: err.message || 'Não foi possível remover o convite.',
        duration: 6000,
        action: {
          label: "Tentar Novamente",
          onClick: () => {}
        }
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // 🧹 LIMPEZA EM BACKGROUND - Executar limpeza física via Edge Function (opcional)
  const cleanupDeletedInvites = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-deleted-invites', {
        body: { force: false }
      });
      
      if (error) throw error;
      
      toast.success('🧹 Limpeza automática concluída', {
        description: `${data.cleaned_count || 0} convites removidos fisicamente`,
        duration: 3000
      });
    } catch (err: any) {
      console.error('❌ Erro na limpeza:', err);
      toast.error('⚠️ Falha na limpeza automática', {
        description: 'A limpeza será executada automaticamente mais tarde',
        duration: 4000
      });
    }
  }, []);

  // 🗑️ DELETAR FISICAMENTE CONVITE POR EMAIL - Para casos específicos
  const forceDeleteInviteByEmail = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-invite', {
        body: { email }
      });
      
      if (error) throw error;
      
      toast.success('🗑️ Convite deletado fisicamente', {
        description: `${data.message}`,
        duration: 4000
      });
      
      return true;
    } catch (err: any) {
      console.error('❌ Erro na deleção física:', err);
      toast.error('⚠️ Falha na deleção física', {
        description: err.message || 'Não foi possível deletar o convite fisicamente',
        duration: 4000
      });
      return false;
    }
  }, []);

  return {
    isDeleting,
    deleteInvite,
    cleanupDeletedInvites,
    forceDeleteInviteByEmail
  };
}
