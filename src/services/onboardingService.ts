
import { supabase } from "@/lib/supabase";
import { OnboardingFormData } from "@/types/onboardingForm";

/**
 * Salva os dados do onboarding usando uma operação upsert
 */
export const saveOnboardingData = async (data: OnboardingFormData): Promise<{ 
  success: boolean; 
  error?: string; 
  id?: string;
}> => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      return { 
        success: false, 
        error: "Usuário não autenticado. Por favor, faça login novamente." 
      };
    }
    
    // Verificar se já existe um registro para este usuário
    const { data: existingData, error: queryError } = await supabase
      .from("onboarding_users")
      .select("id")
      .eq("user_id", user.user.id)
      .maybeSingle();
      
    if (queryError) {
      console.error("Erro ao verificar dados existentes:", queryError);
      return { success: false, error: "Erro ao verificar dados existentes" };
    }
    
    // Dados a serem enviados
    const onboardingData = {
      ...data,
      user_id: user.user.id
    };
    
    // Se existir, atualiza; se não, insere
    if (existingData?.id) {
      const { error: updateError } = await supabase
        .from("onboarding_users")
        .update(onboardingData)
        .eq("id", existingData.id);
      
      if (updateError) {
        console.error("Erro ao atualizar dados:", updateError);
        return { success: false, error: "Erro ao atualizar dados: " + updateError.message };
      }
      
      return { success: true, id: existingData.id };
    } else {
      // Inserir novo registro
      const { data: insertData, error: insertError } = await supabase
        .from("onboarding_users")
        .insert(onboardingData)
        .select('id')
        .single();
      
      if (insertError) {
        console.error("Erro ao inserir dados:", insertError);
        return { success: false, error: "Erro ao inserir dados: " + insertError.message };
      }
      
      return { success: true, id: insertData?.id };
    }
  } catch (error: any) {
    console.error("Erro ao salvar dados de onboarding:", error);
    return { 
      success: false, 
      error: error.message || "Erro ao processar solicitação"
    };
  }
};

/**
 * Busca os dados de onboarding do usuário atual
 */
export const getUserOnboardingData = async (): Promise<{ 
  data: OnboardingFormData | null;
  error?: string;
}> => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      return { data: null, error: "Usuário não autenticado" };
    }
    
    const { data, error } = await supabase
      .from("onboarding_users")
      .select("*")
      .eq("user_id", user.user.id)
      .maybeSingle();
      
    if (error) {
      console.error("Erro ao buscar dados:", error);
      return { data: null, error: "Erro ao buscar dados: " + error.message };
    }
    
    return { data };
  } catch (error: any) {
    console.error("Erro ao buscar dados de onboarding:", error);
    return { 
      data: null, 
      error: error.message || "Erro ao buscar dados"
    };
  }
};
