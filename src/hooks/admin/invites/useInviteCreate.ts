
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
}

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createInvite = async ({ email, roleId, notes, expiresIn = '7 days' }: CreateInviteParams) => {
    try {
      setLoading(true);

      // Usar função RPC para criar convite
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: email,
        p_role_id: roleId,
        p_expires_in: `${expiresIn}::interval`,
        p_notes: notes
      });

      if (error) throw error;

      const result = data as any;
      
      if (result?.status === 'error') {
        throw new Error(result.message || 'Erro ao criar convite');
      }

      toast({
        title: "Convite criado!",
        description: `Convite para ${email} foi criado com sucesso.`,
      });

      return result;
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro ao criar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createInvite, loading };
};
