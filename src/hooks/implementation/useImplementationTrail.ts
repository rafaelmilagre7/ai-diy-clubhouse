
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

      // Verificar perfil de implementação do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.error("Erro ao buscar perfil de implementação:", profileError);
        throw new Error("Erro ao buscar perfil de implementação");
      }

      if (!profileData) {
        console.error("Perfil de implementação não encontrado");
        throw new Error("Perfil de implementação não encontrado");
      }

      if (!profileData.is_completed) {
        console.error("Perfil de implementação incompleto");
        throw new Error("Perfil de implementação incompleto");
      }

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
      if (!session) {
        throw new Error("Sessão de autenticação não encontrada");
      }
      
      const authToken = session.access_token;
      if (!authToken) {
        console.error("Token de autenticação não encontrado na sessão");
        throw new Error("Token de autenticação não encontrado");
      }

      console.log("generateImplementationTrail: Invocando edge function com token de autenticação");
      
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
      
      let errorMessage = "Não foi possível gerar sua trilha.";
      
      // Extrair mensagem de erro mais específica se disponível
      if (error.message) {
        if (error.message.includes("incompleto")) {
          errorMessage = "Não foi possível gerar sua trilha. Verifique se seu perfil de implementação está completo.";
        } else if (error.message.includes("não encontrado")) {
          errorMessage = "Não foi possível gerar sua trilha. Perfil de implementação não encontrado.";
        } else if (error.message.includes("autenticação")) {
          errorMessage = "Não foi possível gerar sua trilha. Problema de autenticação.";
        }
      }
      
      setError(errorMessage);
      setDetailedError(error);
      
      // Atualizar status para erro
      if (user?.id) {
        await supabase
          .from("implementation_trails")
          .update({
            status: "error",
            error_message: error.message || "Erro desconhecido",
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
          .eq("status", "pending");
      }

      toast.error(errorMessage, {
        description: "Tente novamente ou entre em contato com o suporte."
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
    let lastError = null;
    
    while (retries <= maxRetries && !success) {
      try {
        console.log(`Tentativa ${retries + 1} de ${maxRetries + 1} para gerar trilha`);
        result = await generateImplementationTrail(onboardingData);
        if (result) {
          success = true;
          console.log(`Tentativa ${retries + 1} bem-sucedida!`);
        } else {
          retries++;
          if (retries <= maxRetries) {
            console.log(`Tentativa ${retries} falhou, tentando novamente em 2 segundos...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // espera 2 segundos
          }
        }
      } catch (e) {
        lastError = e;
        retries++;
        console.error(`Erro na tentativa ${retries}:`, e);
        if (retries <= maxRetries) {
          console.log(`Aguardando ${retries * 2} segundos antes de nova tentativa...`);
          await new Promise(resolve => setTimeout(resolve, retries * 2000));
        }
      }
    }
    
    if (!success && lastError) {
      throw lastError; // propagar o último erro se todas as tentativas falharem
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
