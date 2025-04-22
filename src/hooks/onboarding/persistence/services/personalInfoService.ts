
import { supabase } from "@/lib/supabase";
import { OnboardingProgress, PersonalInfo } from "@/types/onboarding";

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
