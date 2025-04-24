
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";
import { 
  fetchPersonalInfo, 
  formatPersonalInfoData 
} from "./personalInfoService";

/**
 * Busca todos os dados de onboarding para um usuário
 * Incluindo dados das tabelas específicas de cada etapa
 */
export const fetchAllOnboardingData = async (progressId: string): Promise<OnboardingProgress | null> => {
  try {
    console.log("[DEBUG] Buscando todos os dados de onboarding para progresso:", progressId);
    
    // 1. Buscar o registro principal
    const { data: mainProgress, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("id", progressId)
      .single();
      
    if (error) {
      console.error("[ERRO] Erro ao buscar progresso principal:", error);
      return null;
    }
    
    if (!mainProgress) {
      console.error("[ERRO] Progresso não encontrado:", progressId);
      return null;
    }
    
    console.log("[DEBUG] Progresso principal encontrado:", mainProgress);
    
    // 2. Buscar dados específicos de cada etapa
    // 2.1 Dados Pessoais
    const personalInfoData = await fetchPersonalInfo(progressId);
    
    // Adicionar chamadas para outras tabelas aqui conforme necessário
    
    // 3. Mesclar dados em um único objeto de progresso
    const progress: OnboardingProgress = {
      ...mainProgress,
    };
    
    // 3.1 Mesclar dados pessoais
    if (personalInfoData) {
      const formattedPersonalInfo = formatPersonalInfoData(personalInfoData);
      console.log("[DEBUG] Mesclando dados pessoais:", formattedPersonalInfo);
      progress.personal_info = {
        ...progress.personal_info,
        ...formattedPersonalInfo.personal_info
      };
    }
    
    // Adicionar mesclas para outras tabelas aqui conforme necessário
    
    return progress;
  } catch (error) {
    console.error("[ERRO] Erro ao buscar todos os dados de onboarding:", error);
    return null;
  }
};
