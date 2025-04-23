
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
  const [detailedError, setDetailedError] = useState<any>(null);

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
      console.log("useImplementationTrail: Usuário não autenticado");
      return null;
    }

    try {
      if (!forceRefresh && trail && hasContent()) {
        console.log("useImplementationTrail: Usando trilha em cache");
        return trail;
      }

      setIsLoading(true);
      setError(null);
      setDetailedError(null);
      console.log("useImplementationTrail: Carregando trilha existente para", user.id);

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
        setDetailedError(loadError);
        return null;
      }

      console.log("useImplementationTrail: Resultado da consulta:", data);

      if (data?.trail_data) {
        console.log("useImplementationTrail: Trilha encontrada, sanitizando dados");
        const sanitizedData = sanitizeTrailData(data.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
      } else {
        console.log("useImplementationTrail: Nenhuma trilha encontrada");
      }

      return null;
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      setError("Erro ao carregar sua trilha");
      setDetailedError(error);
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
      console.log("generateImplementationTrail: Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setDetailedError(null);
      console.log("generateImplementationTrail: Iniciando geração para", user.id);

      // Buscar trilha existente primeiro para evitar regenerações desnecessárias
      const { data: existingTrail } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTrail) {
        console.log("generateImplementationTrail: Trilha existente encontrada");
        const sanitizedData = sanitizeTrailData(existingTrail.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
      }

      console.log("generateImplementationTrail: Criando registro pendente");
      // Iniciar processo de geração - criar ou atualizar registro pendente
      const { error: updateError } = await supabase
        .from("implementation_trails")
        .upsert({
          user_id: user.id,
          status: "pending",
          generation_attempts: 1,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("Erro ao criar registro pendente:", updateError);
        throw updateError;
      }

      // Obter token de autenticação atual
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        console.error("Sessão de autenticação inválida");
        throw new Error("Sessão de autenticação inválida");
      }

      console.log("generateImplementationTrail: Invocando edge function");
      // Chamar função de geração com headers de autenticação explícitos
      const { data: generatedData, error: fnError } = await supabase.functions.invoke(
        "generate-implementation-trail",
        {
          body: { onboardingData },
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (fnError) {
        console.error("Erro na função de geração:", fnError);
        throw fnError;
      }

      console.log("generateImplementationTrail: Resposta da edge function:", generatedData);

      if (!generatedData || !generatedData.recommendations) {
        console.error("Resposta da edge function sem recomendações:", generatedData);
        throw new Error("A função de geração retornou uma resposta inválida");
      }

      const recommendationsToSave = generatedData.recommendations;

      // Atualizar status para completed
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
        console.error("Erro ao salvar trilha:", saveError);
        throw saveError;
      }

      const sanitizedData = sanitizeTrailData(recommendationsToSave);
      setTrail(sanitizedData);
      console.log("generateImplementationTrail: Trilha gerada com sucesso");
      
      return sanitizedData;
    } catch (error: any) {
      console.error("Erro ao gerar trilha:", error);
      setError("Não foi possível gerar sua trilha. Verifique seu perfil de implementação.");
      setDetailedError(error);
      
      // Atualizar status para erro
      await supabase
        .from("implementation_trails")
        .update({
          status: "error",
          error_message: error.message || "Erro desconhecido",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      toast.error("Não foi possível gerar sua trilha. Verifique se seu perfil de implementação está completo.", {
        description: error.message || "Erro ao processar sua solicitação."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar trilha com delay e retentativas
  const generateWithRetries = async (onboardingData: any, maxRetries = 2) => {
    let retries = 0;
    let success = false;
    let result = null;
    
    while (retries <= maxRetries && !success) {
      try {
        result = await generateImplementationTrail(onboardingData);
        if (result) {
          success = true;
        } else {
          retries++;
          if (retries <= maxRetries) {
            console.log(`Tentativa ${retries} falhou, tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // espera 2 segundos
          }
        }
      } catch (e) {
        retries++;
        console.error(`Erro na tentativa ${retries}:`, e);
        if (retries <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    return result;
  };

  // Carregar trilha ao montar o componente
  useEffect(() => {
    loadExistingTrail();
  }, [loadExistingTrail]);

  return {
    trail,
    isLoading,
    error,
    detailedError,
    hasContent: hasContent(),
    refreshTrail,
    generateImplementationTrail,
    generateWithRetries
  };
};
