
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

      console.log("🚀 Criando convite com função híbrida:", {
        email,
        roleId,
        expiresIn,
        channelPreference
      });

      // Usar função híbrida do banco que já existe e é robusta
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_phone: phone || null,
        p_role_id: roleId,
        p_expires_in: `${expiresIn}::interval`, // Conversão para tipo interval
        p_notes: notes || null,
        p_channel_preference: channelPreference
      });

      if (error) {
        console.error('❌ Erro na função RPC:', error);
        throw new Error(error.message || 'Erro ao criar convite');
      }

      // A função retorna um JSON, então acessamos diretamente
      const result = data as any;
      
      console.log("📋 Resposta da função híbrida:", result);

      // Verificar se houve erro na função
      if (result?.status === 'error') {
        const errorMessage = result.message || 'Erro desconhecido ao criar convite';
        console.error('❌ Erro retornado pela função:', errorMessage);
        throw new Error(errorMessage);
      }

      // Verificar se temos os dados esperados
      if (!result?.invite_id || !result?.token) {
        console.error('❌ Resposta inválida da função:', result);
        throw new Error('Resposta inválida do servidor');
      }

      toast({
        title: "Convite criado com sucesso!",
        description: `Convite para ${email} foi criado e está pronto para ser enviado.`,
      });

      console.log("✅ Convite criado com sucesso:", {
        inviteId: result.invite_id,
        token: result.token,
        expiresAt: result.expires_at
      });

      return {
        invite_id: result.invite_id,
        token: result.token,
        expires_at: result.expires_at,
        status: 'success' as const,
        message: result.message || 'Convite criado com sucesso'
      };

    } catch (error: any) {
      console.error('❌ Erro completo ao criar convite:', error);
      
      // Tratamento de erros mais específico
      let errorMessage = "Ocorreu um erro inesperado";
      
      if (error.message) {
        if (error.message.includes('permissão')) {
          errorMessage = "Você não tem permissão para criar convites";
        } else if (error.message.includes('email')) {
          errorMessage = "Email inválido ou já convidado";
        } else if (error.message.includes('role')) {
          errorMessage = "Papel de usuário inválido";
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
