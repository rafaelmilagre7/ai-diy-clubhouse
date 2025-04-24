
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { sanitizeTrailData } from "./utils";
import { useGenerateImplementationTrail } from "./useGenerateTrail";

// Exportação de tipos usando "export type" para lidar com isolatedModules
export type ImplementationRecommendation = {
  solutionId: string;
  justification: string;
};

export type ImplementationTrail = {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
};

/**
 * Hook principal de trilha de implementação
 */
export const useImplementationTrail = () => {
  const { user, session } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [lastGenerationTime, setLastGenerationTime] = useState<Date | null>(null);

  // Verificar se a trilha tem conteúdo
  const hasContent = useCallback(() => {
    if (!trail) return false;
    const totalItems = (trail.priority1?.length || 0)
      + (trail.priority2?.length || 0)
      + (trail.priority3?.length || 0);
    return totalItems > 0;
  }, [trail]);

  // Carregar trilha existente simplificado
  const loadExistingTrail = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado");
      return null;
    }
    try {
      setIsLoading(true);
      setError(null);
      setDetailedError(null);

      // Se já existe trilha e não precisa refresh, usa do estado
      if (!forceRefresh && trail && hasContent()) return trail;

      const { data, error: loadError } = await import("@/lib/supabase")
        .then(m => m.supabase)
        .then(supabase => supabase
          .from("implementation_trails")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        );
      if (loadError) {
        setError("Erro ao carregar sua trilha");
        setDetailedError(loadError);
        return null;
      }
      if (data?.trail_data) {
        const sanitizedData = sanitizeTrailData(data.trail_data as ImplementationTrail);
        setTrail(sanitizedData);
        return sanitizedData;
      }
      return null;
    } catch (error) {
      setError("Erro ao carregar sua trilha");
      setDetailedError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, trail, hasContent]);

  // Recarregar trilha
  const refreshTrail = useCallback((forceRefresh = false) => loadExistingTrail(forceRefresh), [loadExistingTrail]);

  // Usar hook de geração externalizado
  const generateImplementationTrail = useGenerateImplementationTrail(
    user, session, setIsLoading, setError, setDetailedError, setTrail, setLastGenerationTime
  );

  const generateWithRetries = async (onboardingData: any, maxRetries = 2) => {
    let retries = 0, success = false, result = null, lastError = null;
    while (retries <= maxRetries && !success) {
      try {
        result = await generateImplementationTrail(onboardingData);
        if (result) {
          success = true;
        } else {
          retries++;
          if (retries <= maxRetries) await new Promise(res => setTimeout(res, 2000));
        }
      } catch (e) {
        lastError = e;
        retries++;
        if (retries <= maxRetries) await new Promise(res => setTimeout(res, retries * 2000));
      }
    }
    if (!success && lastError) throw lastError;
    return result;
  };

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
    generateWithRetries,
    lastGenerationTime
  };
};
