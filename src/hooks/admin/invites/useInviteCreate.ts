
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { generateInviteUrl } from '@/utils/inviteValidationUtils';

export const useInviteCreate = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createInvite = async (
    email: string,
    roleId: string,
    notes?: string,
    expiresIn: string = '7 days',
    phone?: string,
    channelPreference: 'email' | 'whatsapp' | 'both' = 'email'
  ) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      setIsCreating(true);
      
      console.log("🔥 [INVITE-CREATE] Iniciando criação de convite:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone,
        user: user.id
      });

      // 1. Criar o convite usando a função híbrida
      const { data: inviteData, error: inviteError } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_role_id: roleId,
        p_phone: phone,
        p_expires_in: `${expiresIn}`,
        p_notes: notes,
        p_channel_preference: channelPreference
      });

      if (inviteError) {
        console.error("❌ [INVITE-CREATE] Erro ao criar convite:", inviteError);
        throw inviteError;
      }

      if (inviteData.status === 'error') {
        console.error("❌ [INVITE-CREATE] Erro na função:", inviteData.message);
        throw new Error(inviteData.message);
      }

      console.log("✅ [INVITE-CREATE] Convite criado com sucesso:", {
        inviteId: inviteData.invite_id,
        token: inviteData.token,
        expiresAt: inviteData.expires_at
      });

      // 2. Gerar URL do convite
      const inviteUrl = generateInviteUrl(inviteData.token);
      console.log("🔗 [INVITE-CREATE] URL gerada:", inviteUrl);
      
      // 3. Buscar nome do papel para o envio
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      if (roleError) {
        console.warn("⚠️ [INVITE-CREATE] Erro ao buscar papel:", roleError);
      }

      // 4. Registrar tentativa ANTES de chamar a Edge Function
      console.log("📝 [INVITE-CREATE] Registrando tentativa de envio...");
      const { error: attemptError } = await supabase.from('invite_send_attempts').insert({
        invite_id: inviteData.invite_id,
        email,
        method_attempted: 'edge_function_start',
        status: 'pending'
      });

      if (attemptError) {
        console.error("❌ [INVITE-CREATE] Erro ao registrar tentativa:", attemptError);
      }

      // 5. Chamar Edge Function para envio do email
      console.log("📧 [INVITE-CREATE] Chamando Edge Function para envio...");
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName: roleData?.name || 'membro',
          expiresAt: inviteData.expires_at,
          senderName: user.user_metadata?.name || user.email,
          notes,
          inviteId: inviteData.invite_id,
          forceResend: true
        }
      });

      console.log("📬 [INVITE-CREATE] Resultado da Edge Function:", { 
        emailResult, 
        emailError,
        hasData: !!emailResult,
        success: emailResult?.success
      });

      if (emailError) {
        console.error("❌ [INVITE-CREATE] Erro na Edge Function:", emailError);
        
        // Atualizar tentativa como falhada
        await supabase.from('invite_send_attempts')
          .update({
            error_message: emailError.message,
            status: 'failed',
            method_attempted: 'edge_function_error'
          })
          .eq('invite_id', inviteData.invite_id)
          .eq('status', 'pending');

        toast.warning('Convite criado, mas houve problema no envio', {
          description: `Erro: ${emailError.message}`
        });
      } else if (emailResult?.success) {
        console.log("✅ [INVITE-CREATE] Email enviado com sucesso");
        
        // Atualizar tentativa como bem-sucedida
        await supabase.from('invite_send_attempts')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            method_attempted: 'edge_function_success'
          })
          .eq('invite_id', inviteData.invite_id)
          .eq('status', 'pending');

        // Atualizar estatísticas do convite
        await supabase.from('invites')
          .update({
            last_sent_at: new Date().toISOString(),
            send_attempts: 1
          })
          .eq('id', inviteData.invite_id);

        toast.success('Convite criado e enviado com sucesso!', {
          description: emailResult.message || 'Email enviado para ' + email
        });
      } else {
        console.error("❌ [INVITE-CREATE] Edge Function retornou resultado inválido:", emailResult);
        
        // Atualizar tentativa como falhada
        await supabase.from('invite_send_attempts')
          .update({
            error_message: emailResult?.error || 'Resposta inválida da Edge Function',
            status: 'failed',
            method_attempted: 'edge_function_invalid_response'
          })
          .eq('invite_id', inviteData.invite_id)
          .eq('status', 'pending');

        toast.warning('Convite criado, mas houve problema no envio', {
          description: emailResult?.error || 'Erro desconhecido no envio'
        });
      }

      return inviteData;
    } catch (err: any) {
      console.error('❌ [INVITE-CREATE] Erro crítico:', err);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao criar convite';
      let description = err.message || 'Não foi possível criar o convite.';
      
      if (err.message?.includes('já existe')) {
        errorMessage = 'Convite já existe';
        description = 'Este email já possui um convite pendente.';
      } else if (err.message?.includes('role')) {
        errorMessage = 'Papel inválido';
        description = 'O papel selecionado não é válido.';
      } else if (err.message?.includes('email')) {
        errorMessage = 'Email inválido';
        description = 'Verifique se o formato do email está correto.';
      } else if (err.message?.includes('permission')) {
        errorMessage = 'Sem permissão';
        description = 'Você não tem permissão para criar convites.';
      }
      
      toast.error(errorMessage, { description });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};
