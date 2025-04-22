
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
  if (!progressId) {
    console.error("ID de progresso não fornecido para atualização");
    return { data: null, error: new Error("ID de progresso não fornecido") };
  }
  
  // Certifique-se de que o ID seja uma string válida
  progressId = String(progressId).trim();
  
  if (!progressId) {
    console.error("ID de progresso inválido:", progressId);
    return { data: null, error: new Error("ID de progresso inválido") };
  }
  
  // Normalizar as atualizações antes do envio
  const normalizedUpdates = normalizeOnboardingResponse(updates as OnboardingProgress);
  
  // Limpar metadados e campos de sistema antes de enviar para o Supabase
  const cleanedUpdates = { ...normalizedUpdates };
  
  // Remover campos de metadados especiais que podem causar problemas
  delete (cleanedUpdates as any)._metadata;
  delete (cleanedUpdates as any).id;
  delete (cleanedUpdates as any).user_id;
  delete (cleanedUpdates as any).created_at;
  
  // Limpar metadados de objetos aninhados
  Object.keys(cleanedUpdates).forEach(key => {
    if (typeof cleanedUpdates[key as keyof typeof cleanedUpdates] === 'object' && 
        cleanedUpdates[key as keyof typeof cleanedUpdates] !== null) {
      const objField = cleanedUpdates[key as keyof typeof cleanedUpdates] as any;
      delete objField._metadata;
      delete objField._last_updated;
    }
  });
  
  console.log("Atualizando progresso ID:", progressId);
  console.log("Atualizando progresso normalizado:", cleanedUpdates);
  
  try {
    const { data: rawData, error } = await supabase
      .from("onboarding_progress")
      .update(cleanedUpdates)
      .eq("id", progressId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar progresso:", error);
      return { data: null, error };
    }
    
    const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    console.log("Progresso atualizado com sucesso:", data);
    
    return { data, error: null };
  } catch (e) {
    console.error("Exceção ao atualizar progresso:", e);
    return { data: null, error: e };
  }
};

export const refreshOnboardingProgress = async (progressId: string) => {
  if (!progressId) {
    console.error("ID de progresso não fornecido para recarga");
    return { data: null, error: new Error("ID de progresso não fornecido") };
  }
  
  console.log("Recarregando dados do progresso com ID:", progressId);
  
  try {
    const { data: rawData, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("id", progressId)
      .single();
      
    if (error) {
      console.error("Erro ao recarregar progresso:", error);
      return { data: null, error };
    }
    
    const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    console.log("Dados atualizados obtidos e normalizados:", data);
    
    return { data, error: null };
  } catch (e) {
    console.error("Exceção ao recarregar progresso:", e);
    return { data: null, error: e };
  }
};
