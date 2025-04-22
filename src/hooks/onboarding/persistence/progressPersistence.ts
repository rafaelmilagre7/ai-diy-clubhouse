import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";

// Função para validar e normalizar dados antes de salvar
const normalizeOnboardingData = (data: Partial<OnboardingProgress>) => {
  const normalizedData = { ...data };
  
  // Normalizar DDI no personal_info se existir
  if (normalizedData.personal_info?.ddi) {
    // Garantir que o DDI tenha apenas um + no início
    normalizedData.personal_info.ddi = "+" + normalizedData.personal_info.ddi.replace(/\+/g, '').replace(/\D/g, '');
  }
  
  // Normalizar URL do website se existir
  if (normalizedData.professional_info?.company_website) {
    const website = normalizedData.professional_info.company_website;
    if (website && typeof website === 'string' && !website.match(/^https?:\/\//)) {
      normalizedData.professional_info.company_website = `https://${website}`;
    }
  }
  
  // Também normalizar website no campo top-level
  if (normalizedData.company_website) {
    const website = normalizedData.company_website;
    if (website && typeof website === 'string' && !website.match(/^https?:\/\//)) {
      normalizedData.company_website = `https://${website}`;
    }
  }
  
  // Converter campos que são string para objetos quando deveriam ser objetos
  const objectFields = ['ai_experience', 'business_goals', 'experience_personalization', 'complementary_info',
                      'professional_info', 'business_data', 'business_context', 'personal_info',
                      'industry_focus', 'resources_needs', 'team_info', 'implementation_preferences'];
  
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    if (typeof value === 'string') {
      try {
        // Tentar converter de string JSON para objeto
        (normalizedData as any)[field] = JSON.parse(value);
        console.log(`Campo ${field} convertido de string JSON para objeto:`, (normalizedData as any)[field]);
      } catch (e) {
        // Se não for JSON válido, inicializar como objeto vazio
        console.warn(`Campo ${field} é string mas não é JSON válido, inicializando como objeto vazio`);
        (normalizedData as any)[field] = {};
      }
    } else if (value === null) {
      // Inicializar como objeto vazio se for null
      (normalizedData as any)[field] = {};
    }
  });
  
  // Garantir que arrays de completed_steps estejam sempre corretamente formados
  if (normalizedData.completed_steps) {
    if (typeof normalizedData.completed_steps === 'string') {
      try {
        // Tentar converter de string JSON para array
        normalizedData.completed_steps = JSON.parse(normalizedData.completed_steps as unknown as string);
      } catch (e) {
        // Se falhar, iniciar como array vazio
        normalizedData.completed_steps = [];
      }
    }
    
    // Garantir que é um array
    if (!Array.isArray(normalizedData.completed_steps)) {
      normalizedData.completed_steps = [];
    }
  }
  
  return normalizedData;
};

// Função para normalizar dados após buscar do banco
const normalizeOnboardingResponse = (data: OnboardingProgress): OnboardingProgress => {
  if (!data) return data;
  
  // Cópia para não modificar o original
  const normalizedData = { ...data };
  
  // Converter campos que são string para objetos quando deveriam ser objetos
  const objectFields = ['ai_experience', 'business_goals', 'experience_personalization', 'complementary_info',
                       'professional_info', 'business_data', 'business_context', 'personal_info',
                       'industry_focus', 'resources_needs', 'team_info', 'implementation_preferences'];
  
  objectFields.forEach(field => {
    const value = normalizedData[field as keyof typeof normalizedData];
    if (typeof value === 'string') {
      try {
        // Tentar fazer parse como JSON
        (normalizedData as any)[field] = JSON.parse(value as string);
      } catch (e) {
        // Se não for JSON válido, inicializar como objeto vazio
        console.warn(`Campo ${field} é string mas não é JSON válido, inicializando como objeto vazio`);
        (normalizedData as any)[field] = {};
      }
    } else if (value === null) {
      // Inicializar como objeto vazio se for null
      (normalizedData as any)[field] = {};
    }
  });
  
  // Garantir que completed_steps seja um array
  if (normalizedData.completed_steps) {
    if (typeof normalizedData.completed_steps === 'string') {
      try {
        // Tentar converter de string JSON para array
        normalizedData.completed_steps = JSON.parse(normalizedData.completed_steps as unknown as string);
      } catch (e) {
        // Se falhar, iniciar como array vazio
        normalizedData.completed_steps = [];
      }
    }
    
    // Garantir que é um array
    if (!Array.isArray(normalizedData.completed_steps)) {
      normalizedData.completed_steps = [];
    }
  } else {
    normalizedData.completed_steps = [];
  }
  
  // Validar campos específicos
  
  // Website - garantir formato adequado
  if (normalizedData.professional_info?.company_website) {
    const website = normalizedData.professional_info.company_website;
    if (typeof website === 'string' && !website.match(/^https?:\/\//)) {
      normalizedData.professional_info.company_website = `https://${website}`;
    }
  }
  
  if (normalizedData.company_website) {
    const website = normalizedData.company_website;
    if (typeof website === 'string' && !website.match(/^https?:\/\//)) {
      normalizedData.company_website = `https://${website}`;
    }
  }
  
  // DDI - garantir formato adequado
  if (normalizedData.personal_info?.ddi) {
    const ddi = normalizedData.personal_info.ddi;
    if (typeof ddi === 'string') {
      normalizedData.personal_info.ddi = "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
    }
  }
  
  return normalizedData;
};

// Buscar progresso do onboarding
export const fetchOnboardingProgress = async (userId: string) => {
  console.log("Buscando progresso de onboarding para usuário:", userId);
  
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
  // Normalizar dados antes de salvar
  const normalizedUpdates = normalizeOnboardingData(updates);
  
  // Remover campos que não existem na tabela
  const cleanedUpdates = { ...normalizedUpdates };
  
  // Remover campos _metadata se existirem - causador do erro
  if ('_metadata' in cleanedUpdates) delete cleanedUpdates._metadata;
  
  // Verificar campos aninhados com _metadata e removê-los
  Object.keys(cleanedUpdates).forEach(key => {
    if (typeof cleanedUpdates[key as keyof typeof cleanedUpdates] === 'object' && 
        cleanedUpdates[key as keyof typeof cleanedUpdates] !== null) {
      const objField = cleanedUpdates[key as keyof typeof cleanedUpdates] as any;
      if ('_metadata' in objField) delete objField._metadata;
      if ('_last_updated' in objField) delete objField._last_updated;
    }
  });
  
  console.log("Atualizando progresso normalizado:", cleanedUpdates);
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .update(cleanedUpdates)
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
  console.log("Recarregando dados do progresso com ID:", progressId);
  
  const { data: rawData, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("id", progressId)
    .single();
    
  // Normalizar dados após carregamento
  const data = rawData ? normalizeOnboardingResponse(rawData) : null;
    
  if (error) {
    console.error("Erro ao recarregar progresso:", error);
  } else if (data) {
    console.log("Dados atualizados obtidos e normalizados:", data);
  }
    
  return { data, error };
};
