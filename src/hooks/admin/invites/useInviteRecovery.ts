
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';

export function useInviteRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStats, setRecoveryStats] = useState<{
    total: number;
    successful: number;
    failed: number;
  } | null>(null);

  const recoverOrphanedInvites = useCallback(async (): Promise<void> => {
    setIsRecovering(true);
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🔄 [RECOVERY-${requestId}] Iniciando recuperação de convites órfãos...`);

      // Buscar convites que não foram enviados (sem last_sent_at ou send_attempts = 0)
      const { data: orphanedInvites, error: fetchError } = await supabase
        .from('invites')
        .select(`
          *,
          role:user_roles(name),
          creator:profiles!created_by(name, email)
        `)
        .is('used_at', null) // Não utilizados
        .gt('expires_at', new Date().toISOString()) // Não expirados
        .or('last_sent_at.is.null,send_attempts.eq.0'); // Sem tentativas de envio

      if (fetchError) {
        console.error(`❌ [RECOVERY-${requestId}] Erro ao buscar convites órfãos:`, fetchError);
        throw new Error(`Erro ao buscar convites: ${fetchError.message}`);
      }

      const orphanedCount = orphanedInvites?.length || 0;
      console.log(`📊 [RECOVERY-${requestId}] Encontrados ${orphanedCount} convites órfãos`);

      if (orphanedCount === 0) {
        toast.info('Nenhum convite órfão encontrado', {
          description: 'Todos os convites válidos já foram enviados.'
        });
        setRecoveryStats({ total: 0, successful: 0, failed: 0 });
        return;
      }

      let successful = 0;
      let failed = 0;

      // Processar cada convite órfão
      for (const invite of orphanedInvites!) {
        try {
          console.log(`📧 [RECOVERY-${requestId}] Processando convite: ${invite.email}`);

          const inviteUrl = `${window.location.origin}/accept-invite/${invite.token}`;
          
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: invite.email,
              inviteUrl,
              roleName: invite.role?.name || 'Usuário',
              expiresAt: invite.expires_at,
              senderName: invite.creator?.name || 'Administrador',
              notes: invite.notes,
              inviteId: invite.id,
              forceResend: true,
              requestId,
              token: invite.token
            }
          });

          if (emailError || !emailResult?.success) {
            console.error(`❌ [RECOVERY-${requestId}] Falha no envio para ${invite.email}:`, emailError || emailResult);
            failed++;
          } else {
            console.log(`✅ [RECOVERY-${requestId}] Email enviado com sucesso para ${invite.email}`);
            
            // Atualizar estatísticas do convite
            await supabase.rpc('update_invite_send_attempt', { invite_id: invite.id });
            successful++;
          }

          // Pequena pausa entre envios para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
          console.error(`❌ [RECOVERY-${requestId}] Erro ao processar ${invite.email}:`, error);
          failed++;
        }
      }

      const stats = { total: orphanedCount, successful, failed };
      setRecoveryStats(stats);

      console.log(`🎉 [RECOVERY-${requestId}] Recuperação concluída:`, stats);

      if (successful > 0) {
        toast.success(`Recuperação concluída!`, {
          description: `${successful} de ${orphanedCount} convites foram enviados com sucesso.`
        });
      }

      if (failed > 0) {
        toast.warning(`Alguns convites falharam`, {
          description: `${failed} convites não puderam ser enviados. Verifique o sistema de email.`
        });
      }

    } catch (error: any) {
      console.error(`❌ [RECOVERY-${requestId}] Erro crítico na recuperação:`, error);
      
      toast.error('Erro na recuperação de convites', {
        description: error.message || 'Erro desconhecido'
      });
      
      throw error;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const getOrphanedInvitesCount = useCallback(async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .or('last_sent_at.is.null,send_attempts.eq.0');

      if (error) {
        console.error('Erro ao contar convites órfãos:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao contar convites órfãos:', error);
      return 0;
    }
  }, []);

  return {
    recoverOrphanedInvites,
    getOrphanedInvitesCount,
    isRecovering,
    recoveryStats
  };
}
