
import { useState } from "react";
import { toast } from "sonner";

export const useTrustedDomainCreate = () => {
  const [loading, setLoading] = useState(false);

  const createTrustedDomain = async (domain: string, roleId: string, description?: string) => {
    try {
      setLoading(true);
      
      // Simular criação de domínio confiável
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Domínio ${domain} adicionado com sucesso!`);
      return true;
    } catch (error: any) {
      console.error('Erro ao criar domínio confiável:', error);
      toast.error("Erro ao criar domínio confiável");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTrustedDomain,
    loading
  };
};
