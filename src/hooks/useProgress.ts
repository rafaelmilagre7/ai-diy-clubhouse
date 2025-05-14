
import { useState, useEffect, useCallback, useRef } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { useLogging } from "./useLogging";
import { generateValidUUID, isDevelopmentMode } from "@/utils/validationUtils";

/**
 * Hook principal para acessar e manipular o progresso do onboarding
 */
export function useProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastError = useRef<Error | null>(null);
  const { logError, log } = useLogging();

  // Flag para determinar se estamos em modo de desenvolvimento
  const devMode = isDevelopmentMode();

  /**
   * Carrega dados atualizados do progresso do onboarding
   */
  const refreshProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[useProgress] Atualizando dados de progresso do onboarding");
      
      // Simulação de carregamento do progresso (mock)
      // Em uma implementação real, aqui faria a consulta ao banco de dados
      const mockProgress: OnboardingProgress = {
        id: devMode ? generateValidUUID() : "onb-12345",
        user_id: devMode ? generateValidUUID() : "usr-12345",
        current_step: "business_context",
        completed_steps: ["personal_info", "professional_info"],
        is_completed: false,
        personal_info: {
          name: "Usuário Teste",
          email: "teste@exemplo.com",
        },
        professional_info: {
          company_name: "Empresa Teste",
          current_position: "Diretor",
          company_size: "11-50",
          company_sector: "Tecnologia",
          company_website: "https://exemplo.com",
          annual_revenue: "1-5M"
        },
        business_context: {
          business_model: "B2B SaaS",
          business_challenges: ["Expansão de mercado", "Automação de processos"],
          short_term_goals: ["Melhorar conversão"],
          medium_term_goals: ["Lançar novo produto"],
          important_kpis: ["CAC", "LTV"],
          additional_context: "Contexto adicional do negócio"
        },
        business_goals: {},
        ai_experience: {},
        experience_personalization: {},
        complementary_info: {},
        sync_status: "completed",
        onboarding_type: "club"
      };
      
      // Simular um pequeno atraso para mostrar o carregamento
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(mockProgress);
      
      console.log("[useProgress] Dados de progresso atualizados com sucesso");
      log("progress_refreshed", { success: true });
      lastError.current = null;
      
      return mockProgress;
    } catch (error: any) {
      console.error("[useProgress] Erro ao atualizar dados de progresso:", error);
      logError("refresh_progress_error", { error: String(error) });
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [log, logError, devMode]);

  /**
   * Atualiza o progresso do onboarding com novos dados
   */
  const updateProgress = useCallback(async (data: Partial<OnboardingProgress>) => {
    try {
      console.log("[useProgress] Atualizando progresso com dados:", data);
      
      // Simulação de atualização do progresso (mock)
      // Em uma implementação real, aqui faria a atualização no banco de dados
      setProgress(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...data,
          updated_at: new Date().toISOString()
        };
      });
      
      // Log de sucesso na atualização
      log("progress_updated", { success: true });
      lastError.current = null;
      
      // Retornar mock de sucesso
      return { 
        success: true, 
        data: { ...progress, ...data } 
      };
    } catch (error: any) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      logError("update_progress_error", { error: String(error) });
      lastError.current = error instanceof Error ? error : new Error(String(error));
      
      // Retornar mock de erro
      return { 
        error: { 
          message: String(error) 
        } 
      };
    }
  }, [progress, log, logError]);

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    progress,
    isLoading,
    refreshProgress,
    updateProgress,
    lastError: lastError.current,
    isDevelopmentMode: devMode // Exportar a flag para que os serviços saibam se estamos em modo de desenvolvimento
  };
}
