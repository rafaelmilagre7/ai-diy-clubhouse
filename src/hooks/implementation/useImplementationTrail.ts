
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { sanitizeTrailData, saveTrailToLocalStorage, getTrailFromLocalStorage, clearTrailFromLocalStorage } from './useImplementationTrail.utils';
import { toast } from 'sonner';

// Flag global para prevenir chamadas concorrentes
let isGenerationInProgress = false;
let lastGenerationTimestamp = 0;
const GENERATION_COOLDOWN = 5000; // 5 segundos

export interface ImplementationTrail {
  priority1: TrailSolution[];
  priority2: TrailSolution[];
  priority3: TrailSolution[];
  recommended_courses?: TrailCourseRecommendation[];
}

export interface TrailSolution {
  solutionId: string;
  justification?: string;
  priority?: number;
}

export interface TrailCourseRecommendation {
  courseId: string;
  justification?: string;
  priority?: number;
}

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasContent, setHasContent] = useState(false);
  
  // Referência para controlar chamadas duplicadas
  const pendingRequestRef = useRef<boolean>(false);
  const lastGeneratedRef = useRef<number>(0);
  // Referência para o componente montado
  const isMountedRef = useRef<boolean>(true);

  // Quando o componente é desmontado, marca a ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Carregar dados da trilha
  const loadTrailData = useCallback(async (forceRefresh = false) => {
    if (!user || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    // Prevenir chamadas duplicadas
    if (pendingRequestRef.current) {
      console.log("[useImplementationTrail] Requisição já em andamento, ignorando chamada duplicada");
      return;
    }

    try {
      pendingRequestRef.current = true;
      setRefreshing(true);
      setError(null);

      let trailData;

      // Se não forçar atualização, tentar obter do armazenamento local primeiro
      if (!forceRefresh) {
        trailData = getTrailFromLocalStorage(user.id);
        
        if (trailData) {
          console.log("[useImplementationTrail] Usando dados da trilha do armazenamento local");
          if (isMountedRef.current) {
            setTrail(sanitizeTrailData(trailData.trail_data));
            setHasContent(true);
            setIsLoading(false);
            setRefreshing(false);
          }
          pendingRequestRef.current = false;
          return;
        }
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!isMountedRef.current) return;

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado (código PGRST116), não é um erro real
          console.log("[useImplementationTrail] Nenhuma trilha encontrada para o usuário");
          setTrail(null);
          setHasContent(false);
        } else {
          console.error("[useImplementationTrail] Erro ao carregar trilha:", error);
          setError(error);
        }
      } else if (data) {
        console.log("[useImplementationTrail] Trilha carregada com sucesso:", data);
        try {
          const sanitizedData = sanitizeTrailData(data.trail_data);
          setTrail(sanitizedData);
          setHasContent(true);
          
          // Salvar no armazenamento local para uso futuro
          saveTrailToLocalStorage(user.id, data);
        } catch (parseError) {
          console.error("[useImplementationTrail] Erro ao processar dados da trilha:", parseError);
          setError(parseError instanceof Error ? parseError : new Error(String(parseError)));
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("[useImplementationTrail] Erro ao processar dados da trilha:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
      
      // Liberar flag com atraso para evitar condição de corrida
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 300);
    }
  }, [user]);

  // Efeito para carregar a trilha quando o componente é montado
  useEffect(() => {
    loadTrailData();
  }, [loadTrailData]);

  // Função para gerar trilha de implementação
  const generateImplementationTrail = useCallback(async (onboardingData = {}, forceRegenerate = false) => {
    // Verificações de segurança
    if (!user) {
      toast.error("Você precisa estar logado para gerar uma trilha");
      return null;
    }
    
    // Verificação de concorrência global
    if (isGenerationInProgress) {
      console.log("[useImplementationTrail] Outra geração de trilha está em andamento globalmente");
      toast.info("Processando solicitação anterior, aguarde...");
      return null;
    }

    // Verificação de tempo de espera
    const now = Date.now();
    if (!forceRegenerate && (now - lastGenerationTimestamp < GENERATION_COOLDOWN)) {
      const waitTime = Math.round((GENERATION_COOLDOWN - (now - lastGenerationTimestamp)) / 1000);
      console.log(`[useImplementationTrail] Solicitação muito recente, aguarde ${waitTime}s`);
      toast.info(`Por favor, aguarde ${waitTime} segundos antes de tentar novamente.`);
      return null;
    }
    
    // Verificação de concorrência local
    if (pendingRequestRef.current || regenerating) {
      console.log("[useImplementationTrail] Requisição já em andamento localmente");
      toast.info("Processando sua solicitação anterior, aguarde um momento...");
      return null;
    }
    
    try {
      // Atualizar flags de controle
      isGenerationInProgress = true;
      pendingRequestRef.current = true;
      lastGenerationTimestamp = now;
      lastGeneratedRef.current = now;
      
      if (isMountedRef.current) {
        setRegenerating(true);
        setError(null);
      }
      
      // Limpar dados locais da trilha
      clearTrailFromLocalStorage(user.id);
      
      console.log("[useImplementationTrail] Iniciando geração de trilha", { 
        forceRegenerate, 
        userId: user.id 
      });
      
      // Verificar se já existe uma trilha e não está forçando regeneração
      if (!forceRegenerate) {
        const { data: existingTrail } = await supabase
          .from("implementation_trails")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (existingTrail) {
          console.log("[useImplementationTrail] Trilha existente encontrada, retornando sem regenerar");
          // Se já existe uma trilha, retorná-la sem regenerar
          if (isMountedRef.current) {
            try {
              const sanitizedData = sanitizeTrailData(existingTrail.trail_data);
              setTrail(sanitizedData);
              setHasContent(true);
              
              // Salvar no armazenamento local
              saveTrailToLocalStorage(user.id, existingTrail);
              
              return sanitizedData;
            } catch (parseError) {
              console.error("[useImplementationTrail] Erro ao processar dados da trilha existente:", parseError);
              // Continuar para gerar uma nova trilha
            }
          } else {
            return null;
          }
        }
      }
      
      console.log("[useImplementationTrail] Chamando edge function para gerar trilha");
      
      // Simplificar dados de onboarding para evitar payload muito grande
      const simplifiedOnboarding = {
        personal_info: onboardingData.personal_info,
        professional_info: onboardingData.professional_info,
        business_goals: onboardingData.business_goals,
        ai_experience: onboardingData.ai_experience,
        is_completed: onboardingData.is_completed
      };
      
      // Chamar a função de borda para gerar a trilha
      const { data, error } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { 
          userId: user.id,
          hasOnboardingData: true,
          ...simplifiedOnboarding
        }
      });
      
      if (!isMountedRef.current) return null;
      
      console.log("[useImplementationTrail] Resposta da função edge:", { data, error });
      
      if (error) {
        console.error("[useImplementationTrail] Erro na invocação da função edge:", error);
        throw error;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.message || "Falha ao gerar trilha de implementação";
        console.error("[useImplementationTrail] Resposta de erro da função:", errorMsg);
        throw new Error(errorMsg);
      }
      
      // Atualizar estado com a nova trilha
      let sanitizedData;
      try {
        sanitizedData = sanitizeTrailData(data.trail?.trail_data);
        if (isMountedRef.current) {
          setTrail(sanitizedData);
          setHasContent(true);
        }
      } catch (parseError) {
        console.error("[useImplementationTrail] Erro ao processar dados da nova trilha:", parseError);
        throw parseError;
      }
      
      // Salvar no armazenamento local
      if (data.trail) {
        saveTrailToLocalStorage(user.id, data.trail);
      }
      
      console.log("[useImplementationTrail] Trilha gerada com sucesso");
      return sanitizedData;
    } catch (err) {
      if (isMountedRef.current) {
        console.error("[useImplementationTrail] Erro ao gerar trilha de implementação:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
      toast.error("Erro ao gerar trilha de implementação. Tentaremos novamente automaticamente.");
      return null;
    } finally {
      if (isMountedRef.current) {
        setRegenerating(false);
      }
      
      // Liberar flags de concorrência com atrasos diferentes
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 500);
      
      setTimeout(() => {
        isGenerationInProgress = false;
      }, 2000);
    }
  }, [user, regenerating]);

  // Função para atualizar a trilha
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    await loadTrailData(forceRefresh);
  }, [loadTrailData]);

  return {
    trail,
    isLoading,
    error,
    hasContent,
    generateImplementationTrail,
    refreshTrail,
    regenerating,
    refreshing
  };
};
