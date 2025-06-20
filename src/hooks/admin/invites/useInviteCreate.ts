
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
  phone?: string;
  channelPreference?: 'email' | 'whatsapp' | 'both';
}

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createInvite = async ({ 
    email, 
    roleId, 
    notes, 
    expiresIn = '7 days',
    phone,
    channelPreference = 'email' 
  }: CreateInviteParams) => {
    try {
      setLoading(true);

      console.log("🚀 Criando convite com função híbrida modernizada:", {
        email,
        roleId,
        expiresIn,
        channelPreference
      });

      // Usar função híbrida robusta do banco
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_phone: phone || null,
        p_role_id: roleId,
        p_expires_in: `${expiresIn}::interval`,
        p_notes: notes || null,
        p_channel_preference: channelPreference
      });

      if (error) {
        console.error('❌ Erro na função RPC:', error);
        throw new Error(error.message || 'Erro ao criar convite');
      }

      const result = data as any;
      
      console.log("📋 Resposta da função híbrida:", result);

      // Verificar se houve erro na função híbrida
      if (result?.status === 'error') {
        const errorMessage = result.message || 'Erro desconhecido ao criar convite';
        console.error('❌ Erro retornado pela função:', errorMessage);
        throw new Error(errorMessage);
      }

      // Validar resposta da função
      if (!result?.invite_id || !result?.token) {
        console.error('❌ Resposta inválida da função:', result);
        throw new Error('Resposta inválida do servidor');
      }

      toast({
        title: "Convite criado com sucesso!",
        description: `Convite para ${email} foi criado usando o sistema híbrido.`,
      });

      console.log("✅ Convite criado com arquitetura híbrida:", {
        inviteId: result.invite_id,
        token: result.token,
        expiresAt: result.expires_at,
        channel: channelPreference
      });

      return {
        invite_id: result.invite_id,
        token: result.token,
        expires_at: result.expires_at,
        status: 'success' as const,
        message: result.message || 'Convite criado com sucesso',
        channel_used: channelPreference
      };

    } catch (error: any) {
      console.error('❌ Erro completo ao criar convite:', error);
      
      // Tratamento de erros melhorado e específico
      let errorMessage = "Ocorreu um erro inesperado";
      
      if (error.message) {
        if (error.message.includes('permissão')) {
          errorMessage = "Você não tem permissão para criar convites";
        } else if (error.message.includes('email')) {
          errorMessage = "Email inválido ou já convidado";
        } else if (error.message.includes('role')) {
          errorMessage = "Papel de usuário inválido";
        } else if (error.message.includes('telefone') || error.message.includes('phone')) {
          errorMessage = "Telefone é obrigatório para envio via WhatsApp";
        } else if (error.message.includes('canal') || error.message.includes('channel')) {
          errorMessage = "Preferência de canal inválida";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erro ao criar convite",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createInvite, loading };
};
