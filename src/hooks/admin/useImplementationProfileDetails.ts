
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationProfileDetails = (profileId?: string) => {
  const { toast } = useToast();
  const { log, logError } = useLogging();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["implementation-profile", profileId],
    queryFn: async () => {
      try {
        if (!profileId) throw new Error("ID do perfil não fornecido");

        const { data, error } = await supabase
          .from("implementation_profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) throw error;

        log("Detalhes do perfil carregados", { profileId });
        return data;
      } catch (err) {
        logError("Erro ao carregar detalhes do perfil", err);
        toast({
          title: "Erro ao carregar detalhes",
          description: "Não foi possível carregar os detalhes do perfil.",
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: !!profileId,
  });

  return {
    profile,
    isLoading,
    error,
  };
};
