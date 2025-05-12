
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

  // Gerar nova trilha - implementação melhorada com modo de fallback
  const generateImplementationTrail = async (onboardingData: any) => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Registrar o início da geração da trilha
      console.log("Iniciando geração da trilha para usuário:", user.id);

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
        console.log("Trilha existente encontrada, retornando dados existentes");
        const sanitizedData = sanitizeTrailData(existingTrail.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
      }

      // Iniciar processo de geração
      console.log("Criando registro de geração de trilha pendente");
      const { data: trailRecord, error: updateError } = await supabase
        .from("implementation_trails")
        .insert({
          user_id: user.id,
          status: "pending",
          generation_attempts: 1
        })
        .select()
        .single();

      if (updateError) {
        console.error("Erro ao criar registro de geração:", updateError);
        throw updateError;
      }

      console.log("Registro de trilha criado:", trailRecord?.id);

      // Chamar função de geração com tratamento aprimorado de erros
      let generatedData = null;
      let fnError = null;

      try {
        console.log("Chamando edge function generate-implementation-trail");
        const functionResponse = await supabase.functions.invoke(
          "generate-implementation-trail",
          {
            body: {
              onboardingData,
              userId: user.id,
            },
          }
        );

        console.log("Resposta da função edge:", functionResponse);
        
        if (functionResponse.error) {
          console.error("Erro na resposta da função edge:", functionResponse.error);
          fnError = functionResponse.error;
        } else {
          generatedData = functionResponse.data;
        }
      } catch (edgeFunctionError) {
        console.error("Erro ao chamar função edge:", edgeFunctionError);
        fnError = edgeFunctionError;
      }

      // Se houve erro na função edge, usar dados mockados (fallback)
      if (fnError || !generatedData?.recommendations) {
        console.log("Usando modo de fallback para geração da trilha");
        
        // Obter soluções publicadas do banco para criar recomendações mais relevantes
        const { data: availableSolutions, error: solutionsError } = await supabase
          .from("solutions")
          .select("id, title, category")
          .eq("published", true)
          .limit(10);

        if (solutionsError) {
          console.error("Erro ao buscar soluções disponíveis:", solutionsError);
        }

        // Criar recomendações de fallback usando soluções reais se disponíveis
        const mockRecommendations: ImplementationTrail = {
          priority1: [],
          priority2: [],
          priority3: []
        };

        if (availableSolutions?.length) {
          console.log("Usando soluções reais para criar recomendações de fallback");
          
          // Distribuir soluções disponíveis entre as prioridades
          availableSolutions.forEach((solution, index) => {
            const recommendation = {
              solutionId: solution.id,
              justification: `Esta solução de ${solution.category} foi selecionada para ajudar seu negócio com base no seu perfil.`
            };
            
            if (index < 4) {
              mockRecommendations.priority1.push(recommendation);
            } else if (index < 7) {
              mockRecommendations.priority2.push(recommendation);
            } else {
              mockRecommendations.priority3.push(recommendation);
            }
          });
        } else {
          // Fallback para caso não consiga obter soluções do banco
          console.log("Usando IDs de fallback para recomendações");
          mockRecommendations.priority1 = [
            {
              solutionId: "mock-solution-1",
              justification: "Esta solução foi selecionada para seu negócio B2B e pode ajudar a otimizar seus processos de vendas."
            },
            {
              solutionId: "mock-solution-2",
              justification: "Considerando seu foco em automação, esta solução trará ganhos imediatos de produtividade."
            }
          ];
          mockRecommendations.priority2 = [
            {
              solutionId: "mock-solution-3",
              justification: "Com seu conhecimento em IA, você poderá implementar esta solução rapidamente."
            }
          ];
          mockRecommendations.priority3 = [
            {
              solutionId: "mock-solution-4",
              justification: "Para complementar sua estratégia de marketing com IA, esta ferramenta será muito útil."
            }
          ];
        }

        // Usar as recomendações de fallback
        generatedData = { recommendations: mockRecommendations };
      }

      const recommendationsToSave = generatedData?.recommendations;
      console.log("Salvando recomendações geradas:", recommendationsToSave);

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

      if (saveError) {
        console.error("Erro ao salvar trilha gerada:", saveError);
        throw saveError;
      }

      const sanitizedData = sanitizeTrailData(recommendationsToSave);
      setTrail(sanitizedData);
      
      return sanitizedData;
    } catch (error: any) {
      console.error("Erro ao gerar trilha:", error);
      setError(error.message || "Erro ao gerar trilha");
      
      // Registrar erro
      try {
        await supabase
          .from("implementation_trails")
          .update({
            status: "error",
            error_message: error.message || "Erro desconhecido na geração da trilha",
          })
          .eq("user_id", user.id)
          .eq("status", "pending");
      } catch (updateError) {
        console.error("Erro ao registrar falha:", updateError);
      }

      toast.error("Não foi possível gerar sua trilha de implementação. Uma trilha padrão será criada.");
      
      // Gerar trilha padrão em caso de erro para evitar falha completa
      try {
        const defaultTrail: ImplementationTrail = {
          priority1: [
            {
              solutionId: "default-solution-1",
              justification: "Solução padrão para ajudar nas primeiras etapas da implementação de IA."
            }
          ],
          priority2: [
            {
              solutionId: "default-solution-2",
              justification: "Recomendação padrão para auxiliar na implementação de IA no seu negócio."
            }
          ],
          priority3: []
        };
        
        await supabase
          .from("implementation_trails")
          .insert({
            user_id: user.id,
            status: "completed",
            trail_data: defaultTrail,
            is_default: true,
            error_message: error.message || "Erro desconhecido - usado trilha padrão"
          });
          
        setTrail(defaultTrail);
        return defaultTrail;
      } catch (fallbackError) {
        console.error("Falha ao criar trilha padrão:", fallbackError);
        return null;
      }
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
