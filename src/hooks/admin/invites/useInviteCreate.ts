
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
      console.log(`🎯 [${requestId}] INICIANDO CRIAÇÃO DE CONVITE:`, params);

      // ETAPA 1: Criar convite usando função do banco
      console.log(`📝 [${requestId}] Chamando create_invite...`);
      const { data: createResult, error: createError } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null
      });

      if (createError) {
        console.error(`❌ [${requestId}] Erro na função create_invite:`, createError);
        throw new Error(`Erro ao criar convite: ${createError.message}`);
      }

      if (!createResult || createResult.status !== 'success') {
        console.error(`❌ [${requestId}] Função retornou falha:`, createResult);
        throw new Error(createResult?.message || 'Falha ao criar convite');
      }

      console.log(`✅ [${requestId}] Convite criado no banco:`, createResult);

      // ETAPA 2: Buscar dados do convite - Query mais simples
      console.log(`🔍 [${requestId}] Buscando dados do convite...`);
      const { data: inviteData, error: fetchError } = await supabase
        .from('invites')
        .select(`
          id, email, token, role_id, expires_at, used_at, created_by, created_at, notes,
          send_attempts, last_sent_at
        `)
        .eq('id', createResult.invite_id)
        .single();

      if (fetchError || !inviteData) {
        console.error(`❌ [${requestId}] Erro ao buscar convite:`, fetchError);
        console.log(`🔄 [${requestId}] Usando dados de fallback...`);
        
        // FALLBACK: Usar dados básicos com todas as propriedades necessárias
        const fallbackInvite = {
          id: createResult.invite_id,
          email: params.email,
          token: createResult.token,
          role_id: params.roleId,
          expires_at: createResult.expires_at,
          used_at: null,
          created_by: null, // Será preenchido pelo contexto de auth
          created_at: new Date().toISOString(),
          notes: params.notes || null,
          send_attempts: 0,
          last_sent_at: null,
          role: { name: 'Usuário' },
          creator: { name: 'Administrador' }
        };
        
        console.log(`🔄 [${requestId}] Dados de fallback criados:`, fallbackInvite);
        
        // Prosseguir com envio de email usando fallback
        const inviteUrl = `${window.location.origin}/accept-invite/${createResult.token}`;
        
        const emailResult = await sendEmailWithFallback(requestId, {
          email: params.email,
          inviteUrl,
          roleName: 'Usuário',
          expiresAt: createResult.expires_at,
          senderName: 'Administrador',
          notes: params.notes,
          inviteId: createResult.invite_id,
          token: createResult.token
        });

        return {
          status: emailResult.success ? 'success' : 'partial_success',
          message: emailResult.success ? 'Convite criado e enviado' : 'Convite criado, verificar email',
          invite: fallbackInvite,
          emailResult
        };
      }

      console.log(`✅ [${requestId}] Dados do convite encontrados:`, inviteData);

      // ETAPA 3: Enviar email
      const inviteUrl = `${window.location.origin}/accept-invite/${inviteData.token}`;
      console.log(`📧 [${requestId}] Enviando email para:`, params.email);

      const emailResult = await sendEmailWithFallback(requestId, {
        email: params.email,
        inviteUrl,
        roleName: 'Usuário', // Simplificado por enquanto
        expiresAt: inviteData.expires_at,
        senderName: 'Administrador',
        notes: params.notes,
        inviteId: inviteData.id,
        token: inviteData.token
      });

      // ETAPA 4: Atualizar estatísticas
      await supabase.rpc('update_invite_send_attempt', { invite_id: inviteData.id });

      const finalStatus = emailResult.success ? 'success' : 'partial_success';
      
      if (emailResult.success) {
        console.log(`🎉 [${requestId}] SUCESSO COMPLETO!`);
        toast.success('Convite enviado com sucesso!', {
          description: `Email enviado para ${params.email}`
        });
      } else {
        console.warn(`⚠️ [${requestId}] Convite criado mas email falhou`);
        toast.warning('Convite criado', {
          description: 'Email pode ter falhado, use a recuperação se necessário'
        });
      }

      return {
        status: finalStatus,
        message: emailResult.success ? 'Convite criado e enviado' : 'Convite criado, verificar email',
        invite: inviteData,
        emailResult
      };

    } catch (error: any) {
      console.error(`💥 [${requestId}] ERRO CRÍTICO:`, error);
      
      toast.error('Erro ao criar convite', {
        description: error.message || 'Erro desconhecido'
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Método auxiliar para envio de email com fallback
  const sendEmailWithFallback = async (requestId: string, emailData: any) => {
    try {
      console.log(`📧 [${requestId}] Chamando Edge Function...`);
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          ...emailData,
          requestId,
          forceResend: false
        }
      });

      if (emailError) {
        console.error(`❌ [${requestId}] Erro na Edge Function:`, emailError);
        return {
          success: false,
          message: 'Erro na Edge Function',
          error: emailError.message,
          channel: 'email' as const
        };
      }

      if (!emailResult?.success) {
        console.error(`❌ [${requestId}] Edge Function retornou falha:`, emailResult);
        return {
          success: false,
          message: 'Edge Function falhou',
          error: emailResult?.message || 'Falha não especificada',
          channel: 'email' as const
        };
      }

      console.log(`✅ [${requestId}] Email enviado com sucesso!`);
      return {
        success: true,
        message: 'Email enviado com sucesso',
        emailId: emailResult.emailId,
        strategy: emailResult.strategy,
        method: emailResult.method,
        channel: 'email' as const
      };

    } catch (error: any) {
      console.error(`💥 [${requestId}] Erro no envio de email:`, error);
      return {
        success: false,
        message: 'Erro crítico no envio',
        error: error.message,
        channel: 'email' as const
      };
    }
  };

  return {
    createInvite,
    loading
  };
}
