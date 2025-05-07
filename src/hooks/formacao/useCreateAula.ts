
import { useState } from "react";
import { AulaFormValues } from "@/components/formacao/aulas/wizard/AulaStepWizard";

interface CreateAulaOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useCreateAula = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (aulaData: AulaFormValues, options?: CreateAulaOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulação de chamada de API
      console.log("Criando aula com dados:", aulaData);
      
      // Simular um delay para fazer parecer real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular resposta da API
      const response = {
        id: "aula-" + Date.now(),
        ...aulaData,
        created_at: new Date().toISOString()
      };
      
      // Chamar callback de sucesso
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
      
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err);
      
      // Chamar callback de erro
      if (options?.onError) {
        options.onError(err);
      }
      
      setIsLoading(false);
      throw err;
    }
  };

  return {
    mutate,
    isLoading,
    error
  };
};
