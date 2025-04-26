import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sanitizeTrailData } from "./useImplementationTrail.utils";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useQueryClient } from '@tanstack/react-query';

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
  const { progress: onboardingProgress } = useProgress();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Verificar se a trilha tem conteúdo
  const hasContent = useCallback(() => {
    if (!trail) return false;
    
    const totalItems = 
      (trail.priority1?.length || 0) + 
      (trail.priority2?.length || 0) + 
      (trail.priority3?.length || 0);
    
    return totalItems > 0;
  }, [trail]);

  // Carregar trilha existente com suporte para cache
  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }

    try {
      // Verificar cache primeiro para uso imediato
      const cachedTrail = queryClient.getQueryData<any>(['implementation-trail']);
      
      // Se temos dados em cache e não é forçado refresh, use-os imediatamente
      if (!forceRefresh && cachedTrail?.trail_data) {
        const sanitizedData = sanitizeTrailData(cachedTrail.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        setIsLoading(false);
        
        // Ainda assim, faça um refresh em background se dados tiverem mais de 5 minutos
        const lastFetched = queryClient.getQueryState(['implementation-trail'])?.dataUpdatedAt;
        const isStale = !lastFetched || (Date.now() - lastFetched > 5 * 60 * 1000);
        
        if (isStale) {
          // Não mostrar loading, mas atualizar em background
          fetchTrailData(user.id).then(data => {
            if (data?.trail_data) {
              const refreshedData = sanitizeTrailData(data.trail_data as ImplementationTrail);
              setTrail(refreshedData);
              queryClient.setQueryData(['implementation-trail'], data);
            }
          });
        }
        
        return sanitizedData;
      }

      // Se não temos cache ou é refresh forçado, busque dados
      setIsLoading(true);
      setError(null);

      const data = await fetchTrailData(user.id);
      
      if (data?.trail_data) {
        const sanitizedData = sanitizeTrailData(data.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        queryClient.setQueryData(['implementation-trail'], data);
        setIsLoading(false);
        return sanitizedData;
      }

      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      setError("Erro ao carregar sua trilha");
      setIsLoading(false);
      return null;
    }
  }, [user, queryClient]);

  // Função auxiliar para buscar dados da trilha
  const fetchTrailData = async (userId: string) => {
    const { data, error: loadError } = await supabase
      .from("implementation_trails")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (loadError) {
      console.error("Erro ao carregar trilha:", loadError);
      setError("Erro ao carregar sua trilha");
      return null;
    }
    
    return data;
  };

  // Recarregar trilha (com opção de força)
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    return loadExistingTrail(forceRefresh);
  }, [loadExistingTrail]);

  // Gerar nova trilha
  const generateImplementationTrail = async (options: any = {}) => {
    if (!user) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Verificar se o onboarding está completo
      if (onboardingProgress && !onboardingProgress.is_completed) {
        toast.error("É necessário completar o onboarding antes de gerar uma trilha personalizada.");
        throw new Error("Onboarding não completo");
      }

      // Buscar trilha existente
      const { data: existingTrail } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTrail && !options.forceRegenerate) {
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

      // Buscar dados do onboarding para gerar recomendações
      const { data: onboardingData, error: onboardingError } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (onboardingError) {
        throw new Error("Erro ao recuperar dados do onboarding");
      }

      // Chamar função de geração (edge function)
      const { data: generatedData, error: fnError } = await supabase.functions.invoke(
        "generate-implementation-trail",
        {
          body: {
            onboardingData
          },
        }
      );

      if (fnError) throw fnError;

      // Processar dados gerados ou usar mockup se a função ainda não estiver implementada
      let trailData = generatedData?.trail || createMockTrail(onboardingData);

      // Atualizar no banco de dados
      const { error: saveError } = await supabase
        .from("implementation_trails")
        .update({
          status: "completed",
          trail_data: trailData,
          updated_at: new Date()
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (saveError) throw saveError;

      // Atualizar estado
      const sanitizedData = sanitizeTrailData(trailData as ImplementationTrail);
      setTrail(sanitizedData);
      return sanitizedData;
    } catch (error: any) {
      console.error("Erro ao gerar trilha:", error);
      setError(error.message || "Erro ao gerar sua trilha");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para criar uma trilha mockada se necessário (temporário)
  const createMockTrail = (userData: any) => {
    // Identificar áreas de interesse ou necessidades baseadas nas respostas
    const businessChallenges = userData?.business_context?.business_challenges || [];
    const aiExperience = userData?.ai_experience?.knowledge_level || 'iniciante';
    const primaryGoal = userData?.business_goals?.primary_goal || '';
    
    // Criar mockup de trilha baseado nas informações do usuário
    return {
      priority1: [
        {
          solutionId: "mock-solution-1",
          justification: `Esta solução é ideal para ${primaryGoal} e ajudará a resolver ${businessChallenges[0] || 'desafios iniciais'} com IA.`
        },
        {
          solutionId: "mock-solution-2",
          justification: `Como você tem experiência ${aiExperience} em IA, esta solução é um passo importante para avançar.`
        }
      ],
      priority2: [
        {
          solutionId: "mock-solution-3",
          justification: "Esta solução complementa perfeitamente seu objetivo principal e tem boa sinergia com as soluções prioritárias."
        }
      ],
      priority3: [
        {
          solutionId: "mock-solution-4",
          justification: "Para uma visão mais completa, esta solução ajudará a expandir o alcance de sua estratégia de IA no futuro."
        }
      ]
    };
  };

  // Efeito para carregar a trilha ao montar - com prefetch e cache
  useEffect(() => {
    // Buscar dados do cache primeiro, se houver
    const cachedData = queryClient.getQueryData<any>(['implementation-trail']);
    if (cachedData?.trail_data) {
      const sanitizedData = sanitizeTrailData(cachedData.trail_data as ImplementationTrail);
      setTrail(sanitizedData);
      setIsLoading(false);
    }
    
    // Carregar dados frescos ou atualizar cache
    loadExistingTrail();
  }, [loadExistingTrail, queryClient]);

  return {
    trail,
    isLoading,
    error,
    hasContent: hasContent(),
    refreshTrail,
    generateImplementationTrail,
  };
};
