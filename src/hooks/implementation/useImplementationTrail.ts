import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  sanitizeTrailData, 
  saveTrailToLocalStorage, 
  getTrailFromLocalStorage, 
  clearTrailFromLocalStorage 
} from "./useImplementationTrail.utils";

export type ImplementationRecommendation = {
  solutionId: string;
  justification: string;
};

export type CourseRecommendation = {
  courseId: string;
  justification: string;
  priority?: number;
};

export type ImplementationTrail = {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
  recommended_courses?: CourseRecommendation[];
};

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validSolutionsCache, setValidSolutionsCache] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Verificar se a trilha tem conteúdo
  const hasContent = useCallback(() => {
    if (!trail) return false;
    
    const totalItems = 
      (trail.priority1?.length || 0) + 
      (trail.priority2?.length || 0) + 
      (trail.priority3?.length || 0);
    
    return totalItems > 0;
  }, [trail]);

  // Função para verificar se uma solução existe no banco
  const validateSolutionId = useCallback(async (solutionId: string): Promise<boolean> => {
    // Se já verificamos antes, retornar do cache
    if (validSolutionsCache.has(solutionId)) {
      return true;
    }

    try {
      const { data, error } = await supabase
        .from("solutions")
        .select("id")
        .eq("id", solutionId)
        .eq("published", true)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar solução:", error);
        return false;
      }

      const isValid = !!data;
      
      if (isValid) {
        // Adicionar ao cache para futuras verificações
        setValidSolutionsCache(prev => new Set([...prev, solutionId]));
      }
      
      return isValid;
    } catch (err) {
      console.error("Erro ao verificar solução:", err);
      return false;
    }
  }, [validSolutionsCache]);

  // Filtrar recomendações para incluir apenas soluções válidas
  const filterValidRecommendations = useCallback(async (recommendations: ImplementationRecommendation[]): Promise<ImplementationRecommendation[]> => {
    if (!recommendations || !recommendations.length) return [];
    
    const validatedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const isValid = await validateSolutionId(rec.solutionId);
        return isValid ? rec : null;
      })
    );
    
    return validatedRecommendations.filter(Boolean) as ImplementationRecommendation[];
  }, [validateSolutionId]);

  // Carregar trilha existente com validação de IDs e suporte a cache local
  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }

    try {
      // Verificar se não estamos forçando atualização e já temos dados em cache
      if (!forceRefresh && trail && hasContent()) {
        console.log("Usando trilha em memória");
        return trail;
      }

      setIsLoading(true);
      setError(null);
      setRefreshing(true);

      // Tentar primeiro obter do cache local se não estiver forçando refresh
      if (!forceRefresh) {
        const cachedTrail = getTrailFromLocalStorage(user.id);
        if (cachedTrail) {
          console.log("Usando trilha do cache local");
          const sanitizedCacheData = sanitizeTrailData(cachedTrail);
          if (sanitizedCacheData && hasValidSolutions(sanitizedCacheData)) {
            setTrail(sanitizedCacheData);
            setIsLoading(false);
            setRefreshing(false);
            setLastRefresh(Date.now());
            return sanitizedCacheData;
          }
        }
      }

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
        setRefreshing(false);
        return null;
      }

      if (data?.trail_data) {
        let trailData = sanitizeTrailData(data.trail_data as ImplementationTrail);
        
        // Validar e filtrar soluções que não existem mais
        if (trailData) {
          const validPriority1 = await filterValidRecommendations(trailData.priority1);
          const validPriority2 = await filterValidRecommendations(trailData.priority2);
          const validPriority3 = await filterValidRecommendations(trailData.priority3);
          
          trailData = {
            priority1: validPriority1,
            priority2: validPriority2,
            priority3: validPriority3
          };
          
          // Salvar no cache local
          if (user?.id) {
            saveTrailToLocalStorage(user.id, trailData);
          }
          
          // Atualizar a trilha no banco se alguma solução foi removida
          if (
            validPriority1.length < (data.trail_data.priority1?.length || 0) ||
            validPriority2.length < (data.trail_data.priority2?.length || 0) ||
            validPriority3.length < (data.trail_data.priority3?.length || 0)
          ) {
            try {
              await supabase
                .from("implementation_trails")
                .update({ trail_data: trailData })
                .eq("id", data.id);
              
              console.log("Trilha atualizada para remover soluções inválidas");
            } catch (updateErr) {
              console.error("Erro ao atualizar trilha com soluções filtradas:", updateErr);
            }
          }
        }
        
        setTrail(trailData);
        setLastRefresh(Date.now());
        setRefreshing(false);
        return trailData;
      }

      setRefreshing(false);
      return null;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      setError("Erro ao carregar sua trilha");
      setRefreshing(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, trail, hasContent, filterValidRecommendations]);

  // Verificar se a trilha tem soluções válidas
  const hasValidSolutions = (trailData: ImplementationTrail): boolean => {
    const totalItems = 
      (trailData.priority1?.length || 0) + 
      (trailData.priority2?.length || 0) + 
      (trailData.priority3?.length || 0);
    
    return totalItems > 0;
  };

  // Recarregar trilha (com opção de força)
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    setRefreshing(true);
    // Se a última atualização foi há menos de 5 minutos e não estamos forçando,
    // usar os dados existentes
    const fiveMinutesMs = 5 * 60 * 1000;
    if (!forceRefresh && trail && Date.now() - lastRefresh < fiveMinutesMs) {
      console.log("Usando dados em cache (menos de 5 minutos desde a última atualização)");
      setRefreshing(false);
      return trail;
    }

    const result = await loadExistingTrail(forceRefresh);
    setRefreshing(false);
    return result;
  }, [loadExistingTrail, trail, lastRefresh]);

  // Gerar nova trilha - implementação melhorada com modo de fallback
  const generateImplementationTrail = async (onboardingData: any) => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setRegenerating(true);

      // Registrar o início da geração da trilha
      console.log("Iniciando geração da trilha para usuário:", user.id);

      // Buscar trilha existente - apenas para verificação
      const { data: existingTrail } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTrail) {
        console.log("Trilha existente encontrada. Solicitando atualização na Edge Function.");
      }

      // Criar nova entrada pendente para a geração
      console.log("Criando registro de geração de trilha pendente");
      
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
          // Não usar IDs falsos, mas deixar as listas vazias
          console.log("Não foi poss��vel obter soluções do banco. Criando trilha vazia.");
        }

        // Usar as recomendações de fallback
        generatedData = { recommendations: mockRecommendations };
      }

      const recommendationsToSave = generatedData?.recommendations;
      console.log("Trilha gerada com sucesso:", recommendationsToSave);

      // Garantir que o onboarding está marcado como completo
      try {
        await supabase
          .from("onboarding_progress")
          .update({ is_completed: true })
          .eq("user_id", user.id);
      } catch (onboardingErr) {
        console.error("Erro ao atualizar status do onboarding:", onboardingErr);
      }

      const sanitizedData = sanitizeTrailData(recommendationsToSave);
      setTrail(sanitizedData);
      
      // Salvar no cache local
      if (user?.id && sanitizedData) {
        saveTrailToLocalStorage(user.id, sanitizedData);
      }
      
      setLastRefresh(Date.now());
      toast.success("Trilha personalizada gerada com sucesso!");
      
      return sanitizedData;
    } catch (error: any) {
      console.error("Erro ao gerar trilha:", error);
      setError(error.message || "Erro ao gerar trilha");
      
      toast.error("Não foi possível gerar sua trilha de implementação. Uma trilha padrão será criada.");
      
      // Gerar trilha padrão em caso de erro para evitar falha completa
      try {
        // Obter soluções publicadas do banco para criar recomendações mais relevantes
        const { data: availableSolutions } = await supabase
          .from("solutions")
          .select("id, title, category")
          .eq("published", true)
          .limit(5);
        
        const defaultTrail: ImplementationTrail = {
          priority1: [],
          priority2: [],
          priority3: []
        };
        
        // Usar soluções reais se disponíveis
        if (availableSolutions && availableSolutions.length > 0) {
          availableSolutions.forEach((solution, index) => {
            const recommendation = {
              solutionId: solution.id,
              justification: "Recomendação padrão para auxiliar na implementação de IA no seu negócio."
            };
            
            if (index < 2) {
              defaultTrail.priority1.push(recommendation);
            } else if (index < 4) {
              defaultTrail.priority2.push(recommendation);
            } else {
              defaultTrail.priority3.push(recommendation);
            }
          });
        }
        
        setTrail(defaultTrail);
        
        // Salvar no cache local
        if (user?.id) {
          saveTrailToLocalStorage(user.id, defaultTrail);
        }
        
        return defaultTrail;
      } catch (fallbackError) {
        console.error("Falha ao criar trilha padrão:", fallbackError);
        return null;
      }
    } finally {
      setIsLoading(false);
      setRegenerating(false);
    }
  };

  // Carregar trilha ao montar o componente
  useEffect(() => {
    loadExistingTrail();
  }, [loadExistingTrail]);

  // Limpar cache ao desmontar
  useEffect(() => {
    return () => {
      // Não limpar o cache local ao desmontar, somente o cache em memória
      setValidSolutionsCache(new Set());
    };
  }, []);

  return {
    trail,
    isLoading,
    error,
    hasContent: hasContent(),
    refreshTrail,
    generateImplementationTrail,
    regenerating,
    refreshing
  };
};
