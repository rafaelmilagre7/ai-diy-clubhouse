
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se a trilha tem conteúdo
  const hasContent = useCallback(() => {
    if (!trail) return false;
    
    const totalItems = 
      (trail.priority1?.length || 0) + 
      (trail.priority2?.length || 0) + 
      (trail.priority3?.length || 0);
    
    return totalItems > 0;
  }, [trail]);

  // Carregar trilha existente
  const loadExistingTrail = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .single();

      if (loadError) {
        console.error("Erro ao carregar trilha:", loadError);
        setError("Erro ao carregar sua trilha");
        return null;
      }

      if (data?.trail_data) {
        setTrail(data.trail_data as ImplementationTrail);
        return data.trail_data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      setError("Erro ao carregar sua trilha");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Recarregar trilha (com opção de força)
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    if (forceRefresh || !trail) {
      return loadExistingTrail();
    }
    return trail;
  }, [loadExistingTrail, trail]);

  // Gerar nova trilha
  const generateImplementationTrail = async (onboardingData = null) => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar trilha existente
      const { data: existingTrail } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .single();

      if (existingTrail) {
        setTrail(existingTrail.trail_data as ImplementationTrail);
        return existingTrail.trail_data;
      }

      // Iniciar processo de geração
      const { error: updateError } = await supabase
        .from("implementation_trails")
        .insert({
          user_id: user.id,
          status: "pending",
          generation_attempts: 1
        });

      if (updateError) throw updateError;

      // Chamar função de geração
      const { data: generatedData, error: fnError } = await supabase.functions.invoke(
        "generate-implementation-trail",
        {
          body: {
            onboardingData
          },
        }
      );

      if (fnError) throw fnError;

      // Salvar trilha gerada
      const { error: saveError } = await supabase
        .from("implementation_trails")
        .update({
          trail_data: generatedData.recommendations,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (saveError) throw saveError;

      setTrail(generatedData.recommendations);
      toast.success("Trilha personalizada criada com sucesso!");
      
      return generatedData.recommendations;
    } catch (error: any) {
      console.error("Erro ao gerar trilha:", error);
      setError(error.message || "Erro ao gerar trilha");
      
      // Registrar erro
      await supabase
        .from("implementation_trails")
        .update({
          status: "error",
          error_message: error.message,
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      toast.error("Não foi possível gerar sua trilha");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar trilha ao montar o componente
  useEffect(() => {
    loadExistingTrail();
  }, [loadExistingTrail]);

  return {
    trail,
    isLoading,
    error,
    hasContent: hasContent(),
    refreshTrail,
    generateImplementationTrail,
  };
};
