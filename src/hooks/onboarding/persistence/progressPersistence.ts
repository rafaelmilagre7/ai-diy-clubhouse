import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";
import { normalizeOnboardingResponse } from "./normalizers/progressNormalizer";
import { fetchProfessionalData, formatProfessionalData } from "./services/professionalDataService";

// Função auxiliar para validar formato UUID
const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const fetchOnboardingProgress = async (userId: string) => {
  console.log("[DEBUG] Buscando progresso de onboarding para usuário:", userId);
  
  try {
    // Verificar se o ID do usuário é válido antes de fazer chamadas ao banco de dados
    if (!isValidUUID(userId)) {
      console.warn("[WARN] ID de usuário inválido ou simulado, retornando dados simulados:", userId);
      const mockData = {
        id: crypto.randomUUID(),
        user_id: userId,
        current_step: "business_context",
        completed_steps: ["personal_info", "professional_info"],
        is_completed: false,
        personal_info: {
          name: "Usuário Teste",
          email: "teste@exemplo.com",
        },
        professional_info: {
          company_name: "Empresa Teste",
          current_position: "Diretor",
          company_size: "11-50",
          company_sector: "Tecnologia",
          company_website: "https://exemplo.com",
          annual_revenue: "1-5M"
        },
        company_name: "Empresa Teste",
        company_size: "11-50",
        company_sector: "Tecnologia",
        company_website: "https://exemplo.com",
        current_position: "Diretor",
        annual_revenue: "1-5M",
        business_context: {},
        business_goals: {},
        ai_experience: {},
        experience_personalization: {},
        complementary_info: {},
        sync_status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: mockData, error: null };
    }
    
    const { data: rawData, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error("[ERRO] Erro ao buscar progresso:", error);
      return { data: null, error };
    }
    
    if (!rawData) {
      console.log("[DEBUG] Nenhum progresso encontrado para o usuário:", userId);
      return { data: null, error: null };
    }
    
    console.log("[DEBUG] Registro bruto de progresso encontrado:", rawData);
    
    // Normalizar dados do registro principal
    let data = normalizeOnboardingResponse(rawData);
    
    // Buscar dados adicionais das tabelas relacionadas
    if (data.id) {
      try {
        // Buscar dados profissionais
        const professionalData = await fetchProfessionalData(data.id);
        if (professionalData) {
          // Formatar e mesclar com os dados principais
          const formattedProfData = formatProfessionalData(professionalData);
          data = {
            ...data,
            ...formattedProfData
          };
        }
        
        // Adicionar mais chamadas para outras tabelas aqui conforme necessário
        
      } catch (relatedError) {
        console.error("[ERRO] Erro ao buscar dados relacionados:", relatedError);
        // Continuar com os dados que temos
      }
    }
    
    console.log("[DEBUG] Dados normalizados e enriquecidos:", data);
    
    return { data, error: null };
  } catch (err) {
    console.error("[ERRO] Exceção ao buscar progresso:", err);
    return { data: null, error: err };
  }
};

export const createInitialOnboardingProgress = async (user: any) => {
  console.log("[DEBUG] Criando progresso inicial para usuário:", user?.id);
  
  if (!user || !user.id) {
    console.error("[ERRO] Tentativa de criar progresso para usuário inválido:", user);
    return { data: null, error: new Error("Usuário inválido") };
  }
  
  // Verificar se o ID do usuário é válido antes de fazer chamadas ao banco de dados
  if (!isValidUUID(user.id)) {
    console.warn("[WARN] ID de usuário inválido ou simulado, retornando dados simulados:", user.id);
    const mockData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      current_step: "personal_info",
      completed_steps: [],
      is_completed: false,
      personal_info: {
        name: user?.user_metadata?.name || '',
        email: user?.email || '',
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
      company_name: "",
      company_size: "",
      company_sector: "",
      company_website: "",
      current_position: "",
      annual_revenue: "",
      business_context: {},
      business_goals: {},
      ai_experience: {},
      experience_personalization: {},
      complementary_info: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  }
  
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

  console.log("[DEBUG] Dados iniciais para criação:", initialData);

  try {
    const { data, error } = await supabase
      .from("onboarding_progress")
      .insert(initialData)
      .select()
      .single();

    if (error) {
      console.error("[ERRO] Erro ao criar progresso inicial:", error);
      return { data: null, error };
    }
    
    console.log("[DEBUG] Progresso inicial criado com sucesso:", data);
    return { data, error: null };
  } catch (err) {
    console.error("[ERRO] Exceção ao criar progresso inicial:", err);
    return { data: null, error: err };
  }
};

export const updateOnboardingProgress = async (progressId: string, updates: Partial<OnboardingProgress>) => {
  console.log("[DEBUG] Atualizando progresso ID:", progressId);
  console.log("[DEBUG] Atualizações a serem aplicadas:", updates);

  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para atualização");
    return { data: null, error: new Error("ID de progresso não fornecido") };
  }

  progressId = String(progressId).trim();
  if (!progressId) {
    console.error("[ERRO] ID de progresso inválido:", progressId);
    return { data: null, error: new Error("ID de progresso inválido") };
  }
  
  // Verificar se o ID de progresso é válido antes de fazer chamadas ao banco de dados
  if (!isValidUUID(progressId)) {
    console.warn("[WARN] ID de progresso inválido ou simulado, retornando dados simulados:", progressId);
    const mockData = {
      id: progressId,
      ...updates,
      updated_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  }

  try {
    const cleanedUpdates = { ...updates };
    delete (cleanedUpdates as any).company_name;
    delete (cleanedUpdates as any).company_size;
    delete (cleanedUpdates as any).company_sector;
    delete (cleanedUpdates as any).company_website;
    delete (cleanedUpdates as any).current_position;
    delete (cleanedUpdates as any).annual_revenue;

    delete (cleanedUpdates as any).id;
    delete (cleanedUpdates as any).user_id;
    delete (cleanedUpdates as any).created_at;

    Object.keys(cleanedUpdates).forEach(key => {
      if (
        typeof cleanedUpdates[key as keyof typeof cleanedUpdates] === 'object' &&
        cleanedUpdates[key as keyof typeof cleanedUpdates] !== null
      ) {
        const objField = cleanedUpdates[key as keyof typeof cleanedUpdates] as any;
        delete objField._metadata;
        delete objField._last_updated;
      }
    });
    
    const { data: existingProgress, error: queryError } = await supabase
      .from("onboarding_progress")
      .select("id, user_id, created_at")
      .eq("id", progressId)
      .single();
      
    if (queryError) {
      console.error("[ERRO] Erro ao verificar registro existente:", queryError);
      return { data: null, error: queryError };
    }
    
    console.log("[DEBUG] Registro existente encontrado:", existingProgress);
    
    const { data: rawData, error } = await supabase
      .from("onboarding_progress")
      .update(cleanedUpdates)
      .eq("id", progressId)
      .select()
      .single();

    if (error) {
      console.error("[ERRO] Erro ao atualizar progresso:", error);
      return { data: null, error };
    }
    
    if (!rawData) {
      console.error("[ERRO] Nenhum dado retornado após atualização");
      return { data: null, error: new Error("Falha na atualização - nenhum dado retornado") };
    }
    
    console.log("[DEBUG] Resposta bruta após atualização:", rawData);
    
    const data = normalizeOnboardingResponse(rawData);
    console.log("[DEBUG] Progresso atualizado e normalizado:", data);
    
    return { data, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao atualizar progresso:", e);
    return { data: null, error: e };
  }
};

export const refreshOnboardingProgress = async (progressId: string) => {
  console.log("[DEBUG] Recarregando dados do progresso com ID:", progressId);
  
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para recarga");
    return { data: null, error: new Error("ID de progresso não fornecido") };
  }
  
  try {
    const { data: rawData, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("id", progressId)
      .single();
      
    if (error) {
      console.error("[ERRO] Erro ao recarregar progresso:", error);
      return { data: null, error };
    }
    
    if (!rawData) {
      console.error("[ERRO] Nenhum dado encontrado para ID:", progressId);
      return { data: null, error: new Error("Registro não encontrado") };
    }
    
    console.log("[DEBUG] Dados brutos recarregados:", rawData);
    const data = normalizeOnboardingResponse(rawData);
    console.log("[DEBUG] Dados atualizados obtidos e normalizados:", data);
    
    return { data, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao recarregar progresso:", e);
    return { data: null, error: e };
  }
};

export const resetOnboardingProgress = async (userId: string) => {
  console.log("[DEBUG] Resetando progresso de onboarding para usuário:", userId);
  
  if (!userId) {
    console.error("[ERRO] ID de usuário não fornecido para reset");
    return { success: false, error: new Error("ID de usuário não fornecido") };
  }
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("[ERRO] Erro ao obter dados do usuário:", userError);
      return { success: false, error: userError };
    }
    
    const user = userData?.user;
    if (!user) {
      console.error("[ERRO] Usuário não encontrado");
      return { success: false, error: new Error("Usuário não encontrado") };
    }
    
    const { error: deleteError } = await supabase
      .from("onboarding_progress")
      .delete()
      .eq("user_id", userId);
      
    if (deleteError) {
      console.error("[ERRO] Erro ao excluir progresso existente:", deleteError);
      return { success: false, error: deleteError };
    }
    
    console.log("[DEBUG] Progresso existente excluído com sucesso");
    
    const { data: newProgress, error: createError } = await createInitialOnboardingProgress(user);
    
    if (createError) {
      console.error("[ERRO] Erro ao criar novo progresso:", createError);
      return { success: false, error: createError };
    }
    
    console.log("[DEBUG] Novo progresso criado com sucesso:", newProgress);
    
    return { success: true, data: newProgress, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao resetar progresso:", e);
    return { success: false, error: e };
  }
};
