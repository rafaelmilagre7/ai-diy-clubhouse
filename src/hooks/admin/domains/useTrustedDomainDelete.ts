
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useTrustedDomainDelete = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteDomain = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await (supabase as any)
        .from('trusted_domains')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Domínio removido com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao excluir domínio:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir domínio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteDomain, loading };
};
