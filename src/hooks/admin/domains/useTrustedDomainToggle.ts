
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useTrustedDomainToggle = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleDomainStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);

      const { error } = await (supabase as any)
        .from('trusted_domains')
        .update({ is_active: !currentStatus } as any)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Domínio ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } catch (error: any) {
      console.error('Erro ao alterar status do domínio:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do domínio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { toggleDomainStatus, loading };
};
