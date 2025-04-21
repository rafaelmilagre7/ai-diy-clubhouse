
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useProgress } from "@/hooks/onboarding/useProgress";

export type ImplementationRecommendation = {
  solutionId: string;
  justification: string;
};

export type ImplementationTrail = {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
};

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { toast } = useToast();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImplementationTrail = async (onboardingData: any = null) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as soluções publicadas
      const { data: solutions, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) {
        throw solutionsError;
      }

      // Usar os dados de onboarding ou obter do progresso atual
      const onboardingProgress = onboardingData || progress;

      if (!onboardingProgress) {
        throw new Error("Dados de onboarding não disponíveis");
      }

      console.log("Gerando trilha de implementação com dados:", onboardingProgress);

      // Chamar a Edge Function para gerar recomendações
      const { data, error: fnError } = await supabase.functions.invoke("generate-implementation-trail", {
        body: {
          onboardingProgress,
          availableSolutions: solutions,
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data || !data.recommendations) {
        throw new Error("Resposta inválida da função de recomendação");
      }

      console.log("Trilha de implementação gerada:", data.recommendations);
      setTrail(data.recommendations);

      // Opcional: Salvar a trilha gerada no banco de dados
      await saveImplementationTrail(user.id, data.recommendations);

      toast({
        title: "Trilha Personalizada Criada",
        description: "Sua trilha de implementação foi gerada com sucesso!",
      });

      return data.recommendations;
    } catch (error: any) {
      console.error("Erro ao gerar trilha de implementação:", error);
      setError(error.message || "Erro ao gerar trilha de implementação");
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar sua trilha personalizada. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveImplementationTrail = async (userId: string, trailData: ImplementationTrail) => {
    try {
      // Verificar se já existe uma trilha para este usuário
      const { data: existingTrail } = await supabase
        .from("implementation_trails")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingTrail) {
        // Atualizar trilha existente
        await supabase
          .from("implementation_trails")
          .update({
            trail_data: trailData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTrail.id);
      } else {
        // Criar nova trilha
        await supabase
          .from("implementation_trails")
          .insert({
            user_id: userId,
            trail_data: trailData,
          });
      }
    } catch (error) {
      console.error("Erro ao salvar trilha no banco de dados:", error);
      // Não interromper o fluxo se o salvamento falhar
    }
  };

  // Carregar trilha existente ao montar o componente
  useEffect(() => {
    const loadExistingTrail = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error: loadError } = await supabase
          .from("implementation_trails")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (loadError) throw loadError;

        if (data && data.trail_data) {
          setTrail(data.trail_data as ImplementationTrail);
        }
      } catch (error) {
        console.error("Erro ao carregar trilha existente:", error);
        // Não exibir erro para o usuário, apenas no console
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingTrail();
  }, [user]);

  return {
    trail,
    isLoading,
    error,
    generateImplementationTrail,
  };
};
