
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
  
  // Converter campos que são string para objetos quando deveriam ser objetos
  const objectFields = ['ai_experience', 'business_goals', 'experience_personalization', 'complementary_info'];
  
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    if (typeof value === 'string') {
      console.warn(`Convertendo campo ${field} de string para objeto vazio antes de salvar`);
      (normalizedData as any)[field] = {};
    }
  });
  
  return normalizedData;
};

// Função para normalizar dados após buscar do banco
const normalizeOnboardingResponse = (data: OnboardingProgress): OnboardingProgress => {
  if (!data) return data;
  
  // Cópia para não modificar o original
  const normalizedData = { ...data };
  
  // Converter campos que são string para objetos quando deveriam ser objetos
  const objectFields = ['ai_experience', 'business_goals', 'experience_personalization', 'complementary_info'];
  
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    if (typeof value === 'string') {
      console.warn(`Convertendo campo ${field} de string para objeto vazio após carregamento`);
      (normalizedData as any)[field] = {};
    }
  });
  
  return normalizedData;
};

// Buscar progresso do onboarding
export const fetchOnboardingProgress = async (userId: string) => {
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  // Normalizar dados após carregamento
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    
  if (data) {
    console.log("Dados carregados e normalizados do banco:", data);
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
    professional_info: {}, // Inicializar como objeto vazio
    business_data: {}, // Inicializar como objeto vazio
    ai_experience: {}, // Inicializar como objeto vazio
    business_goals: {}, // Inicializar como objeto vazio
    experience_personalization: {}, // Inicializar como objeto vazio
    complementary_info: {}, // Inicializar como objeto vazio
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
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .update(normalizedUpdates)
    .eq("id", progressId)
    .select()
    .single();

  // Normalizar dados após atualização
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;

  if (error) {
    console.error("Erro ao atualizar progresso:", error);
  } else {
    console.log("Progresso atualizado com sucesso:", data);
  }

  return { data, error };
};

export const refreshOnboardingProgress = async (progressId: string) => {
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("id", progressId)
    .single();
    
  // Normalizar dados após carregamento
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    
  if (data) {
    console.log("Dados atualizados obtidos e normalizados:", data);
  }
    
  return { data, error };
};
