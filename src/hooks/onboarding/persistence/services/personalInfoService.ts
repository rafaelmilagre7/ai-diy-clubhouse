
import { supabase } from "@/lib/supabase";
import { OnboardingProgress, PersonalInfo, PersonalInfoData } from "@/types/onboarding";

export const fetchPersonalInfo = async (progressId: string) => {
  try {
    const { data, error } = await supabase
      .from("onboarding_personal_info")
      .select("*")
      .eq("progress_id", progressId)
      .single();
      
    if (error) {
      console.error("Erro ao buscar dados pessoais:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Exceção ao buscar dados pessoais:", err);
    return null;
  }
};

// Alias para compatibilidade com código que usa fetchPersonalInfoData
export const fetchPersonalInfoData = fetchPersonalInfo;

export const formatPersonalInfoData = (data: any): Partial<OnboardingProgress> => {
  if (!data) return {};
  
  const personalInfo: PersonalInfo = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    ddi: data.ddi,
    linkedin: data.linkedin,
    instagram: data.instagram,
    country: data.country,
    state: data.state,
    city: data.city,
    timezone: data.timezone
  };
  
  return {
    personal_info: personalInfo
  };
};

// Adicionando a função que estava faltando
export const savePersonalInfoData = async (
  progressId: string,
  userId: string,
  formData: PersonalInfoData,
  logError: (event: string, data?: Record<string, any>) => void
) => {
  try {
    const { error } = await supabase
      .from("onboarding_personal_info")
      .upsert({
        progress_id: progressId,
        user_id: userId,
        ...formData
      }, { onConflict: "progress_id" });

    if (error) {
      console.error("Erro ao salvar dados pessoais:", error);
      logError("personal_info_save_error", { error: error.message });
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Exceção ao salvar dados pessoais:", err);
    logError("personal_info_save_exception", { error: errorMessage });
    return { success: false, error: err };
  }
};

