
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CreateInviteParams, InviteCreateResult } from "./types";

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);

  const createInvite = async (params: CreateInviteParams): Promise<InviteCreateResult | null> => {
    try {
      setLoading(true);
      
      console.log("🎯 Criando convite:", params);

      // Criar convite via função do Supabase
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes || null
      });

      if (error) {
        console.error("❌ Erro ao criar convite:", error);
        throw error;
      }

      console.log("✅ Resposta da função:", data);

      if (data?.status === 'success') {
        toast.success("Convite criado e enviado com sucesso!");
        return {
          status: 'success',
          message: data.message,
          invite_id: data.invite_id,
          token: data.token
        };
      } else {
        toast.error(data?.message || "Erro ao criar convite");
        return {
          status: 'error',
          message: data?.message || "Erro ao criar convite"
        };
      }
    } catch (error: any) {
      console.error("❌ Erro no useInviteCreate:", error);
      toast.error(error.message || "Erro ao criar convite");
      return {
        status: 'error',
        message: error.message || "Erro ao criar convite"
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvite,
    loading
  };
};
