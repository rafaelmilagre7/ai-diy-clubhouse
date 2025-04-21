
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { saveImplementationTrail } from "./useSaveImplementationTrail";
import { hasTrailContent } from "./useImplementationTrail.utils";

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
  const { toast: uiToast } = useToast();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      return null;
    }

    try {
      if (!forceRefresh && trail && hasTrailContent(trail) && lastUpdated) {
        console.log("Usando trilha em cache:", lastUpdated);
        return trail;
      }

      setIsLoading(true);
      console.log("Carregando trilha existente para usuário:", user.id);
      
      // Modificado para buscar todas as trilhas e pegar a mais recente
      const { data, error: loadError } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (loadError) {
        console.error("Erro ao carregar trilha:", loadError);
        throw loadError;
      }

      if (data && data.length > 0 && data[0].trail_data) {
        console.log("Trilha encontrada no banco:", data[0].updated_at);
        const trailData = data[0].trail_data as ImplementationTrail;
        
        if (hasTrailContent(trailData)) {
          console.log("Trilha com conteúdo válido encontrada");
          setTrail(trailData);
          setLastUpdated(new Date());
          return trailData;
        } else {
          console.log("Trilha encontrada mas sem conteúdo válido");
          setTrail(null);
          return null;
        }
      } else {
        console.log("Nenhuma trilha encontrada para o usuário");
        setTrail(null);
        return null;
      }
    } catch (error) {
      console.error("Erro ao carregar trilha existente:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, trail, lastUpdated]);

  // Limpar trilhas duplicadas e manter apenas a mais recente
  const cleanupDuplicateTrails = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Verificando trilhas duplicadas...");
      
      // Buscar todas as trilhas do usuário
      const { data, error } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Se tiver mais de uma trilha, remover as duplicatas mantendo a mais recente
      if (data && data.length > 1) {
        console.log(`Encontradas ${data.length} trilhas. Removendo duplicatas...`);
        
        // Pular a primeira (mais recente) e deletar as demais
        const trailsToDelete = data.slice(1).map(t => t.id);
        
        const { error: deleteError } = await supabase
          .from("implementation_trails")
          .delete()
          .in("id", trailsToDelete);
          
        if (deleteError) throw deleteError;
        
        console.log(`${trailsToDelete.length} trilhas duplicadas removidas com sucesso.`);
      }
    } catch (err) {
      console.error("Erro ao limpar trilhas duplicadas:", err);
    }
  }, [user]);

  const generateImplementationTrail = async (onboardingData: any = null) => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: solutions, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) {
        throw solutionsError;
      }

      const onboardingProgress = onboardingData || progress;

      if (!onboardingProgress) {
        throw new Error("Dados de onboarding não disponíveis");
      }

      console.log("Gerando trilha de implementação com dados:", onboardingProgress);

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
      
      if (hasTrailContent(data.recommendations)) {
        setTrail(data.recommendations);
        setLastUpdated(new Date());
        
        // Limpar trilhas duplicadas antes de salvar nova
        await cleanupDuplicateTrails();
        
        await saveImplementationTrail(user.id, data.recommendations);
        
        toast.success("Trilha Personalizada Criada", {
          description: "Sua trilha de implementação foi gerada com sucesso!"
        });
        
        return data.recommendations;
      } else {
        throw new Error("A trilha gerada não contém recomendações");
      }
    } catch (error: any) {
      console.error("Erro ao gerar trilha de implementação:", error);
      setError(error.message || "Erro ao gerar trilha de implementação");
      
      toast.error("Erro", {
        description: "Não foi possível gerar sua trilha personalizada. Tente novamente mais tarde."
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrail = useCallback(async (forceRefresh = true) => {
    return await loadExistingTrail(forceRefresh);
  }, [loadExistingTrail]);

  const clearTrail = useCallback(async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("implementation_trails")
        .delete()
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      setTrail(null);
      setLastUpdated(null);
      console.log("Trilha removida com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao remover trilha:", error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    loadExistingTrail();
    
    // Limpar trilhas duplicadas ao inicializar o hook
    cleanupDuplicateTrails();
  }, [loadExistingTrail, cleanupDuplicateTrails]);

  return {
    trail,
    isLoading,
    error,
    generateImplementationTrail,
    refreshTrail,
    clearTrail,
    hasContent: trail ? hasTrailContent(trail) : false
  };
};
