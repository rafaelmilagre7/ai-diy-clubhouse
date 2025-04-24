
import { supabase } from "@/lib/supabase";
import { OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";

export async function fetchProfessionalData(progressId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("onboarding_professional_info")
      .select("*")
      .eq("progress_id", progressId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado, não é um erro crítico
        return null;
      }
      
      console.error("Erro ao buscar dados profissionais:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Exceção ao buscar dados profissionais:", err);
    return null;
  }
}

export function formatProfessionalData(data: any): Partial<any> {
  if (!data) return {};
  
  const professionalInfo: ProfessionalDataInput = {
    company_name: data.company_name,
    company_size: data.company_size,
    company_sector: data.company_sector,
    company_website: data.company_website,
    current_position: data.current_position,
    annual_revenue: data.annual_revenue
  };
  
  // Retornar tanto os dados aninhados quanto os campos de nível superior para compatibilidade
  return {
    professional_info: professionalInfo,
    // Campos explícitos para backward compatibility
    company_name: data.company_name,
    company_size: data.company_size,
    company_sector: data.company_sector,
    company_website: data.company_website,
    current_position: data.current_position,
    annual_revenue: data.annual_revenue
  };
}

/**
 * Salva dados profissionais do usuário
 */
export async function saveProfessionalData(
  progressId: string,
  userId: string,
  formData: ProfessionalDataInput
): Promise<{success: boolean, error?: any}> {
  try {
    // Salvar dados na tabela específica de informações profissionais
    const { error } = await supabase
      .from("onboarding_professional_info")
      .upsert({
        progress_id: progressId,
        user_id: userId,
        ...formData
      }, { onConflict: "progress_id" });

    if (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Exceção ao salvar dados profissionais:", err);
    return { success: false, error: err };
  }
}

/**
 * Sincroniza dados profissionais entre o progresso e a tabela específica
 */
export async function syncProfessionalData(
  progress: OnboardingProgress, 
  overrideData: Partial<ProfessionalDataInput> = {}
): Promise<boolean> {
  try {
    if (!progress || !progress.id) {
      console.error("Progresso inválido para sincronização de dados profissionais");
      return false;
    }
    
    // Verificar se já existe um registro para este progresso
    const { data: existingData, error: queryError } = await supabase
      .from("onboarding_professional_info")
      .select("id")
      .eq("progress_id", progress.id)
      .maybeSingle();
    
    if (queryError && queryError.code !== 'PGRST116') {
      console.error("Erro ao verificar dados profissionais existentes:", queryError);
      return false;
    }
    
    // Determinar a fonte dos dados
    let professionalData: ProfessionalDataInput = { ...overrideData };
    
    // Obter dados do objeto professional_info, se disponível
    if (progress.professional_info) {
      const infoData = typeof progress.professional_info === 'string'
        ? JSON.parse(progress.professional_info as unknown as string)
        : progress.professional_info;
        
      professionalData = {
        ...professionalData,
        ...infoData
      };
    }
    
    // Complementar com campos de nível superior, se necessário
    if (!professionalData.company_name && progress.company_name) {
      professionalData.company_name = progress.company_name;
    }
    
    if (!professionalData.company_size && progress.company_size) {
      professionalData.company_size = progress.company_size;
    }
    
    if (!professionalData.company_sector && progress.company_sector) {
      professionalData.company_sector = progress.company_sector;
    }
    
    if (!professionalData.company_website && progress.company_website) {
      professionalData.company_website = progress.company_website;
    }
    
    if (!professionalData.current_position && progress.current_position) {
      professionalData.current_position = progress.current_position;
    }
    
    if (!professionalData.annual_revenue && progress.annual_revenue) {
      professionalData.annual_revenue = progress.annual_revenue;
    }
    
    const baseData = {
      progress_id: progress.id,
      user_id: progress.user_id,
      ...professionalData
    };
    
    // Inserir ou atualizar conforme necessário
    if (existingData) {
      // Atualizar
      const { error: updateError } = await supabase
        .from("onboarding_professional_info")
        .update(baseData)
        .eq("progress_id", progress.id);
        
      if (updateError) {
        console.error("Erro ao atualizar dados profissionais:", updateError);
        return false;
      }
    } else {
      // Inserir
      const { error: insertError } = await supabase
        .from("onboarding_professional_info")
        .insert(baseData);
        
      if (insertError) {
        console.error("Erro ao inserir dados profissionais:", insertError);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error("Exceção ao sincronizar dados profissionais:", err);
    return false;
  }
}

