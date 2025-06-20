
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInviteDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteInvite = async (inviteId: string) => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast.success("Convite excluído com sucesso!");
    } catch (error: any) {
      console.error('Erro ao excluir convite:', error);
      toast.error(error.message || "Erro ao excluir convite");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteInvite, isDeleting };
};
