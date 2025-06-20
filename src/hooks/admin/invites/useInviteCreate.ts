
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CreateInviteParams, CreateInviteResponse } from './types';

export function useInviteCreate() {
  const [loading, setLoading] = useState(false);

  const createInvite = useCallback(async (params: CreateInviteParams): Promise<CreateInviteResponse | null> => {
    setLoading(true);
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🎯 [${requestId}] Iniciando criação de convite (REFATORADO):`, params);

      // 1. Criar convite usando a função create_invite existente do banco
      const { data: createResult, error: createError } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null
      });

      if (createError) {
        console.error(`❌ [${requestId}] Erro ao criar convite:`, createError);
        throw new Error(`Erro ao criar convite: ${createError.message}`);
      }

      if (!createResult || createResult.status !== 'success') {
        console.error(`❌ [${requestId}] Convite não criado:`, createResult);
        throw new Error(createResult?.message || 'Falha ao criar convite');
      }

      console.log(`✅ [${requestId}] Convite criado com sucesso:`, createResult);

      // 2. Buscar dados completos do convite recém-criado
      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select(`
          *,
          role:user_roles(name),
          creator:profiles!created_by(name, email)
        `)
        .eq('id', createResult.invite_id)
        .single();

      if (fetchError || !invite) {
        console.error(`❌ [${requestId}] Erro ao buscar convite criado:`, fetchError);
        throw new Error('Convite criado mas não foi possível buscar os dados');
      }

      // 3. Gerar URL do convite usando o token correto do banco
      const inviteUrl = `${window.location.origin}/accept-invite/${invite.token}`;
      console.log(`🔗 [${requestId}] URL do convite:`, inviteUrl);

      // 4. Enviar email automaticamente
      console.log(`📧 [${requestId}] Iniciando envio de email...`);
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: params.email,
          inviteUrl,
          roleName: invite.role?.name || 'Usuário',
          expiresAt: invite.expires_at,
          senderName: invite.creator?.name || 'Administrador',
          notes: params.notes,
          inviteId: invite.id,
          requestId,
          token: invite.token // Enviar token para validação na Edge Function
        }
      });

      if (emailError) {
        console.error(`❌ [${requestId}] Erro na Edge Function:`, emailError);
        
        // Atualizar tentativas mesmo com erro
        await supabase.rpc('update_invite_send_attempt', { invite_id: invite.id });
        
        toast.warning('Convite criado, mas falha no envio de email', {
          description: 'O convite foi salvo e pode ser reenviado manualmente.'
        });

        return {
          status: 'partial_success',
          message: 'Convite criado, mas email não foi enviado',
          invite,
          emailResult: {
            success: false,
            message: emailError.message,
            error: emailError.message,
            channel: 'email'
          }
        };
      }

      if (!emailResult?.success) {
        console.error(`❌ [${requestId}] Falha no envio:`, emailResult);
        
        // Atualizar tentativas mesmo com erro
        await supabase.rpc('update_invite_send_attempt', { invite_id: invite.id });
        
        toast.warning('Convite criado, mas email falhou', {
          description: emailResult?.message || 'Erro desconhecido no envio'
        });

        return {
          status: 'partial_success',
          message: 'Convite criado, mas email não foi enviado',
          invite,
          emailResult: {
            success: false,
            message: emailResult?.message || 'Falha no envio',
            error: emailResult?.error,
            channel: 'email'
          }
        };
      }

      // 5. Sucesso completo - atualizar estatísticas
      await supabase.rpc('update_invite_send_attempt', { invite_id: invite.id });

      console.log(`🎉 [${requestId}] Convite criado e email enviado com sucesso!`);
      
      toast.success('Convite enviado com sucesso!', {
        description: `Email enviado para ${params.email}`
      });

      return {
        status: 'success',
        message: 'Convite criado e enviado com sucesso',
        invite,
        emailResult: {
          success: true,
          message: 'Email enviado com sucesso',
          emailId: emailResult.emailId,
          strategy: emailResult.strategy,
          method: emailResult.method,
          channel: 'email'
        }
      };

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erro crítico:`, error);
      
      toast.error('Erro ao criar convite', {
        description: error.message || 'Erro desconhecido'
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createInvite,
    loading
  };
}
