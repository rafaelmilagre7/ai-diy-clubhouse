
import { useState } from "react";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import { toast } from "sonner";

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
      
      // Validar que todos os vídeos têm as propriedades necessárias
      if (aulaData.videos && aulaData.videos.length > 0) {
        const invalidVideos = aulaData.videos.filter(v => !v.title || !v.url);
        if (invalidVideos.length > 0) {
          console.warn("Encontrados vídeos incompletos:", invalidVideos);
          toast.warning("Alguns vídeos podem estar incompletos", {
            description: "Verifique se todos os vídeos têm título e URL"
          });
        }
      }
      
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
      
      toast.success("Aula criada com sucesso!");
      
      setIsLoading(false);
      return response;
    } catch (err: any) {
      console.error("Erro ao criar aula:", err);
      setError(err);
      
      toast.error("Erro ao criar aula", {
        description: err.message || "Ocorreu um erro ao tentar criar a aula"
      });
      
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
