
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { saveImplementationTrail } from "./useSaveImplementationTrail";
import { hasTrailContent, extractErrorMessage, isApiTimeout } from "./useImplementationTrail.utils";

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
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiCallStartTime, setApiCallStartTime] = useState<number | null>(null);

  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }

    try {
      if (!forceRefresh && trail && hasTrailContent(trail) && lastUpdated) {
        console.log("Usando trilha em cache:", lastUpdated);
        return trail;
      }

      setIsLoading(true);
      setError(null);
      console.log("Carregando trilha existente para usuário:", user.id);
      
      setApiCallStartTime(Date.now());
      
      const { data, error: loadError } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      setApiCallStartTime(null);

      if (loadError) {
        console.error("Erro ao carregar trilha:", loadError);
        setError(extractErrorMessage(loadError));
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
          const err = "Trilha encontrada mas sem conteúdo válido";
          console.error(err, trailData);
          setError(err);
          setTrail(null);
          return null;
        }
      } else {
        const err = "Nenhuma trilha encontrada para o usuário";
        console.log(err);
        setError(err);
        setTrail(null);
        return null;
      }
    } catch (error) {
      console.error("Erro ao carregar trilha existente:", error);
      setError(extractErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, trail, lastUpdated]);

  const cleanupDuplicateTrails = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Verificando trilhas duplicadas...");
      
      const { data, error } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 1) {
        console.log(`Encontradas ${data.length} trilhas. Removendo duplicatas...`);
        
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

  const generateImplementationTrail = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setApiCallStartTime(Date.now());

      const { data: solutions, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) {
        throw solutionsError;
      }

      // Usar dados do onboarding
      if (!progress) {
        throw new Error("Dados de onboarding não disponíveis");
      }

      console.log("Gerando trilha de implementação com dados do onboarding");

      const { data, error: fnError } = await supabase.functions.invoke("generate-implementation-trail", {
        body: {
          onboardingProgress: progress,
          availableSolutions: solutions,
        },
      });

      setApiCallStartTime(null);

      if (fnError) {
        throw fnError;
      }

      if (!data || !data.recommendations) {
        throw new Error("Resposta inválida da função de recomendação");
      }

      console.log("Trilha de implementação gerada");
      
      if (hasTrailContent(data.recommendations)) {
        setTrail(data.recommendations);
        setLastUpdated(new Date());
        
        await cleanupDuplicateTrails();
        await saveImplementationTrail(user.id, data.recommendations);
        
        toast.success("Trilha Personalizada Criada", {
          description: "Sua trilha de implementação foi gerada com sucesso!"
        });
        
        return data.recommendations;
      } else {
        const errorMsg = "A trilha gerada não contém recomendações";
        console.error(errorMsg, data.recommendations);
        throw new Error(errorMsg);
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
      setApiCallStartTime(null);
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
