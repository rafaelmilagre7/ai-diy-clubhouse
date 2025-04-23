
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { ImplementationTrail } from "../useImplementationTrail";

// Hook para geração de trilhas de implementação
export const useGenerateImplementationTrail = (
  user: User | null,
  session: Session | null,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setDetailedError: (error: any) => void,
  setTrail: (trail: ImplementationTrail | null) => void,
  setLastGenerationTime: (time: Date | null) => void
) => {
  // Funções e lógica de geração de trilha
  const generateImplementationTrail = async (onboardingData: any) => {
    if (!user || !session) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setDetailedError(null);

      // Implementação simplificada para chamada à API de geração
      const { data: generatedTrailData, error: generationError } = await import("@/lib/supabase")
        .then(m => m.supabase)
        .then(supabase => supabase.functions.invoke("generate-implementation-trail", {
          body: {
            onboardingData,
            userId: user.id
          }
        }));

      // Tratamento de erros da API
      if (generationError) {
        console.error("Erro na API de geração de trilha:", generationError);
        setError("Erro ao gerar sua trilha de implementação");
        setDetailedError(generationError);
        return null;
      }

      // Se dados de trilha foram retornados corretamente
      if (generatedTrailData?.trail) {
        // Salvar no banco de dados
        const { error: saveError } = await import("@/lib/supabase")
          .then(m => m.supabase)
          .then(supabase => supabase.from("implementation_trails").insert({
            user_id: user.id,
            trail_data: generatedTrailData.trail,
            status: "completed",
            created_at: new Date().toISOString()
          }));

        if (saveError) {
          console.error("Erro ao salvar trilha:", saveError);
          setError("Erro ao salvar sua trilha");
          setDetailedError(saveError);
          return null;
        }

        // Atualizar estados
        setTrail(generatedTrailData.trail as ImplementationTrail);
        setLastGenerationTime(new Date());
        return generatedTrailData.trail;
      } else {
        setError("Não foi possível gerar sua trilha");
        console.error("Dados da trilha inválidos:", generatedTrailData);
        return null;
      }
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      setError("Erro inesperado ao gerar sua trilha");
      setDetailedError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return generateImplementationTrail;
};
