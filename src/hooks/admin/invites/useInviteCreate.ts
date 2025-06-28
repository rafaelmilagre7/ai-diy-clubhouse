
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateInviteParams, InviteCreateResult } from "./types";

export const useInviteCreate = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createInvite = async (params: CreateInviteParams): Promise<InviteCreateResult> => {
    try {
      setIsCreating(true);

      // Gerar token único
      const generateToken = () => {
        return Array.from({ length: 12 }, () => 
          'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
        ).join('');
      };

      let token = generateToken();
      
      // Verificar se o token já existe
      let { data: existingInvite } = await supabase
        .from('invites')
        .select('id')
        .eq('token', token)
        .single();

      // Gerar novo token se já existir
      while (existingInvite) {
        token = generateToken();
        const { data } = await supabase
          .from('invites')
          .select('id')
          .eq('token', token)
          .single();
        existingInvite = data;
      }

      // Criar o convite
      const { data: invite, error } = await supabase
        .from('invites')
        .insert({
          email: params.email,
          role_id: params.roleId,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          notes: params.notes,
          whatsapp_number: params.whatsappNumber
        })
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'success',
        message: 'Convite criado com sucesso',
        invite_id: invite.id,
        token: invite.token
      };

    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      return {
        status: 'error',
        message: error.message || 'Erro ao criar convite'
      };
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};
