
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useTrustedDomainCreate = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTrustedDomain = async (domain: string, roleId: string, description?: string) => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('trusted_domains')
        .insert({
          domain,
          role_id: roleId,
          description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Domínio confiável criado com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar domínio:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar domínio confiável",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createTrustedDomain, loading };
};
