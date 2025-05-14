
import { supabase } from "@/lib/supabase";
import { OnboardingData, ProfessionalDataInput } from "@/types/onboarding";
import { isValidUUID, isSimulatedID } from "@/utils/validationUtils";

// Serviço para dados profissionais
export const professionalDataService = {
  async save(progressId: string, userId: string, data: any) {
    try {
      console.log("Salvando dados profissionais via serviço:", { progressId, userId, data });
      
      // Verificar se o ID de progresso é um ID simulado
      if (isSimulatedID(progressId)) {
        console.log("ID de progresso simulado detectado, retornando resposta simulada:", progressId);
        return { 
          simulated: true, 
          success: true,
          data: {
            progress_id: progressId,
            ...data
          }
        };
      }
      
      // Verificar se o ID de progresso é um UUID válido antes de fazer chamadas ao banco de dados
      if (!isValidUUID(progressId)) {
        console.error("ID de progresso inválido:", progressId);
        throw new Error(`ID de progresso inválido: ${progressId}`);
      }
      
      // Extrair os dados profissionais do objeto
      let professionalInfo: Record<string, any> = {};
      
      if ('professional_info' in data) {
        professionalInfo = { ...data.professional_info };
      } else {
        // Assumir que os campos estão no nível raiz
        professionalInfo = {
          company_name: data.company_name || "",
          company_size: data.company_size || "",
          company_sector: data.company_sector || "",
          company_website: data.company_website || "",
          current_position: data.current_position || "",
          annual_revenue: data.annual_revenue || ""
        };
      }
      
      // Preparar objeto de atualização inicial sem o completed_steps
      const initialUpdateData = {
        professional_info: professionalInfo,
        company_name: professionalInfo.company_name || "",
        company_size: professionalInfo.company_size || "",
        company_sector: professionalInfo.company_sector || "",
        company_website: professionalInfo.company_website || "",
        current_position: professionalInfo.current_position || "",
        annual_revenue: professionalInfo.annual_revenue || "",
      };
      
      // Adicionar etapa aos passos concluídos (manipulação do array no cliente)
      const { data: currentProgress, error: fetchError } = await supabase
        .from('onboarding_progress')
        .select('completed_steps')
        .eq('id', progressId)
        .maybeSingle(); // Usar maybeSingle em vez de single para evitar erros
        
      if (fetchError) {
        console.error("Erro ao buscar progresso atual:", fetchError);
        // Não lançar erro, tentar continuar com array vazio
        console.log("Continuando com array vazio de completed_steps");
      }
      
      // Manipular o array de passos completos localmente
      let completedSteps = currentProgress?.completed_steps || [];
      if (!Array.isArray(completedSteps)) {
        completedSteps = []; // Inicializa como array vazio se não for um array
      }
      
      // Adicionar a etapa apenas se não existir
      if (!completedSteps.includes('professional_info')) {
        completedSteps.push('professional_info');
      }
      
      // Criar o objeto de atualização final incluindo o completed_steps
      const updateData = {
        ...initialUpdateData,
        completed_steps: completedSteps,
        sync_status: 'pendente',
        last_sync_at: new Date().toISOString(),
        current_step: 'business_context' // Definir próxima etapa
      };
      
      // Atualizar o progresso com upsert - cria se não existir, atualiza se existir
      const { data: result, error } = await supabase
        .from('onboarding_progress')
        .upsert({
          id: progressId,
          user_id: userId,
          ...updateData
        })
        .select();
        
      if (error) {
        console.error("Erro ao salvar dados profissionais:", error);
        throw new Error(`Erro ao salvar: ${error.message}`);
      }
      
      return result;
    } catch (error: any) {
      console.error("Exceção ao salvar dados profissionais:", error);
      throw error;
    }
  },
  
  async fetch(progressId: string) {
    try {
      // Verificar se o ID de progresso é um ID simulado
      if (isSimulatedID(progressId)) {
        console.log("ID de progresso simulado detectado, retornando dados simulados:", progressId);
        return {
          company_name: "",
          company_size: "",
          company_sector: "",
          company_website: "",
          current_position: "",
          annual_revenue: "",
          professional_info: {
            company_name: "",
            company_size: "",
            company_sector: "",
            company_website: "",
            current_position: "",
            annual_revenue: ""
          }
        };
      }
      
      // Verificar se o ID de progresso é um UUID válido antes de fazer chamadas ao banco de dados
      if (!isValidUUID(progressId)) {
        console.error("ID de progresso inválido para buscar dados profissionais:", progressId);
        return null;
      }
      
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('professional_info, company_name, company_size, company_sector, company_website, current_position, annual_revenue')
        .eq('id', progressId)
        .maybeSingle(); // Usar maybeSingle para evitar erros
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          console.log("Nenhum dado profissional encontrado para o progresso:", progressId);
          return null;
        }
        console.error("Erro ao buscar dados profissionais:", error);
        return null;
      }
      
      return {
        ...data,
        // Garantir que o campo professional_info seja sempre um objeto
        professional_info: data?.professional_info || {}
      };
    } catch (error) {
      console.error("Erro ao buscar dados profissionais:", error);
      return null;
    }
  }
};

// Outros serviços podem ser adicionados aqui no futuro
