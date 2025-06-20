
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
      console.log(`🎯 [${requestId}] Iniciando criação de convite:`, params);

      // 1. Criar convite no banco usando a função híbrida
      const { data: inviteData, error: inviteError } = await supabase.rpc('create_invite_hybrid', {
        p_email: params.email,
        p_phone: params.phone || null,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null,
        p_channel_preference: params.channelPreference || 'email'
      });

      if (inviteError) {
        console.error(`❌ [${requestId}] Erro ao criar convite:`, inviteError);
        throw new Error(`Erro ao criar convite: ${inviteError.message}`);
      }

      if (!inviteData.success) {
        console.error(`❌ [${requestId}] Convite não criado:`, inviteData);
        throw new Error(inviteData.message || 'Falha ao criar convite');
      }

      console.log(`✅ [${requestId}] Convite criado com sucesso:`, inviteData);

      // 2. Buscar dados completos do convite para o envio
      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select(`
          *,
          role:user_roles(name),
          creator:profiles!created_by(name, email)
        `)
        .eq('id', inviteData.invite_id)
        .single();

      if (fetchError || !invite) {
        console.error(`❌ [${requestId}] Erro ao buscar convite criado:`, fetchError);
        throw new Error('Convite criado mas não foi possível buscar os dados');
      }

      // 3. Gerar URL correta do convite
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
          requestId
        }
      });

      if (emailError) {
        console.error(`❌ [${requestId}] Erro na Edge Function:`, emailError);
        
        // Atualizar estatísticas mesmo com erro
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
        
        // Atualizar estatísticas mesmo com erro
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

      // 5. Sucesso completo
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
