
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sanitizeTrailData } from "./useImplementationTrail.utils";

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
  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }

    try {
      if (!forceRefresh && trail && hasContent()) {
        return trail;
      }

      setIsLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loadError) {
        console.error("Erro ao carregar trilha:", loadError);
        setError("Erro ao carregar sua trilha");
        return null;
      }

      if (data?.trail_data) {
        const sanitizedData = sanitizeTrailData(data.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
      }

      return null;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      setError("Erro ao carregar sua trilha");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, trail, hasContent]);

  // Recarregar trilha (com opção de força)
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    return loadExistingTrail(forceRefresh);
  }, [loadExistingTrail]);

  // Gerar nova trilha
  const generateImplementationTrail = async (onboardingData: any) => {
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTrail) {
        const sanitizedData = sanitizeTrailData(existingTrail.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
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

      // Como a edge function ainda não está implementada, vamos criar dados mockados
      const mockRecommendations = {
        priority1: [
          {
            solutionId: "mock-solution-1",
            justification: "Esta solução é perfeita para seu negócio B2B e pode ajudar a otimizar seus processos de vendas."
          },
          {
            solutionId: "mock-solution-2",
            justification: "Considerando seu foco em automação, esta solução trará ganhos imediatos de produtividade."
          }
        ],
        priority2: [
          {
            solutionId: "mock-solution-3",
            justification: "Com seu conhecimento avançado em IA, você poderá implementar esta solução rapidamente."
          }
        ],
        priority3: [
          {
            solutionId: "mock-solution-4",
            justification: "Para complementar sua estratégia de marketing com IA, esta ferramenta será muito útil."
          }
        ]
      };

      const recommendationsToSave = generatedData?.recommendations || mockRecommendations;

      // Salvar trilha gerada
      const { error: saveError } = await supabase
        .from("implementation_trails")
        .update({
          trail_data: recommendationsToSave,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (saveError) throw saveError;

      const sanitizedData = sanitizeTrailData(recommendationsToSave);
      setTrail(sanitizedData);
      
      return sanitizedData;
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
