
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useInviteDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteInvite = async (inviteId: string) => {
    try {
      setIsDeleting(true);

      const { error } = await (supabase as any)
        .from('invites')
        .delete()
        .eq('id', inviteId as any);

      if (error) throw error;

      toast({
        title: "Convite excluído",
        description: "O convite foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir convite:', error);
      toast({
        title: "Erro ao excluir convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteInvite, isDeleting };
};
