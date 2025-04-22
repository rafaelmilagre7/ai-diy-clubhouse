
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";
import { normalizeOnboardingResponse } from "./normalizers/progressNormalizer";

export const fetchOnboardingProgress = async (userId: string) => {
  console.log("Buscando progresso de onboarding para usuário:", userId);
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    
  if (data) {
    console.log("Dados carregados e normalizados do banco:", data);
  } else if (error) {
    console.error("Erro ao buscar progresso:", error);
  } else {
    console.log("Nenhum progresso encontrado para o usuário:", userId);
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
      ddi: "+55",
    },
    professional_info: {
      company_name: "",
      company_size: "",
      company_sector: "",
      company_website: "",
      current_position: "",
      annual_revenue: "",
    },
    business_context: {},
    business_goals: {},
    ai_experience: {},
    experience_personalization: {},
    complementary_info: {},
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

  if (error) {
    console.error("Erro ao criar progresso inicial:", error);
  } else {
    console.log("Progresso inicial criado com sucesso:", data);
  }

  return { data, error };
};

export const updateOnboardingProgress = async (progressId: string, updates: Partial<OnboardingProgress>) => {
  const normalizedUpdates = normalizeOnboardingResponse(updates as OnboardingProgress);
  
  const cleanedUpdates = { ...normalizedUpdates };
  delete (cleanedUpdates as any)._metadata;
  
  Object.keys(cleanedUpdates).forEach(key => {
    if (typeof cleanedUpdates[key as keyof typeof cleanedUpdates] === 'object' && 
        cleanedUpdates[key as keyof typeof cleanedUpdates] !== null) {
      const objField = cleanedUpdates[key as keyof typeof cleanedUpdates] as any;
      delete objField._metadata;
      delete objField._last_updated;
    }
  });
  
  console.log("Atualizando progresso normalizado:", cleanedUpdates);
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .update(cleanedUpdates)
    .eq("id", progressId)
    .select()
    .single();

  const data = rawData ? normalizeOnboardingResponse(rawData) : null;

  if (error) {
    console.error("Erro ao atualizar progresso:", error);
  } else {
    console.log("Progresso atualizado com sucesso:", data);
  }

  return { data, error };
};

export const refreshOnboardingProgress = async (progressId: string) => {
  console.log("Recarregando dados do progresso com ID:", progressId);
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("id", progressId)
    .single();
    
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    
  if (error) {
    console.error("Erro ao recarregar progresso:", error);
  } else if (data) {
    console.log("Dados atualizados obtidos e normalizados:", data);
  }
    
  return { data, error };
};
