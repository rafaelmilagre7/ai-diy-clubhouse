
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";

// Função para validar e normalizar dados antes de salvar
const normalizeOnboardingData = (data: Partial<OnboardingProgress>) => {
  const normalizedData = { ...data };
  
  // Normalizar DDI no personal_info se existir
  if (normalizedData.personal_info?.ddi) {
    // Garantir que o DDI tenha apenas um + no início
    normalizedData.personal_info.ddi = "+" + normalizedData.personal_info.ddi.replace(/\+/g, '').replace(/\D/g, '');
    console.log("DDI normalizado:", normalizedData.personal_info.ddi);
  }
  
  return normalizedData;
};

// Buscar progresso do onboarding
export const fetchOnboardingProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (data) {
    // Verificar e normalizar os dados carregados
    console.log("Dados carregados do banco:", data.personal_info);
  }
    
  return { data, error };
};

export const createInitialOnboardingProgress = async (user: any) => {
  const userName = user?.user_metadata?.name || '';
  const userEmail = user?.email || '';

  const initialData = {
    user_id: user?.id,
    completed_steps: [],
    current_step: 'personal',
    is_completed: false,
    personal_info: {
      name: userName,
      email: userEmail,
      ddi: "+55", // Garantir formato correto desde o início
    },
    professional_info: {},
    business_data: {},
    ai_experience: {},
    business_goals: {},
    experience_personalization: {},
    complementary_info: {},
    industry_focus: {},
    resources_needs: {},
    team_info: {},
    implementation_preferences: {},
    company_name: "",
    company_size: "",
    company_sector: "",
    company_website: "",
    current_position: "",
    annual_revenue: ""
  };

  console.log("Criando progresso inicial:", initialData);

  const { data, error } = await supabase
    .from("onboarding_progress")
    .insert(initialData)
    .select()
    .single();

  return { data, error };
};

export const updateOnboardingProgress = async (progressId: string, updates: Partial<OnboardingProgress>) => {
  // Normalizar dados antes de salvar
  const normalizedUpdates = normalizeOnboardingData(updates);
  
  console.log("Atualizando progresso normalizado:", normalizedUpdates);
  
  const { data, error } = await supabase
    .from("onboarding_progress")
    .update(normalizedUpdates)
    .eq("id", progressId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar progresso:", error);
  } else {
    console.log("Progresso atualizado com sucesso:", data);
  }

  return { data, error };
};

export const refreshOnboardingProgress = async (progressId: string) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("id", progressId)
    .single();
    
  if (data) {
    console.log("Dados atualizados obtidos:", data);
  }
    
  return { data, error };
};
