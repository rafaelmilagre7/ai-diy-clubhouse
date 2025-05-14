
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/onboarding";
import { useAuth } from "@/contexts/auth";

/**
 * Busca o progresso do onboarding para um usuário específico
 */
export async function fetchOnboardingProgress(userId: string) {
  try {
    // Busca o registro de progresso mais recente para o usuário
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[ERRO] Erro ao buscar progresso do onboarding:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao buscar progresso do onboarding:", e);
    return { data: null, error: e };
  }
}

/**
 * Cria um registro inicial de progresso do onboarding para o usuário
 */
export async function createInitialOnboardingProgress(user: any) {
  try {
    // Dados iniciais com base nas informações do usuário
    const initialData = {
      user_id: user.id,
      current_step: "personal_info",
      is_completed: false,
      completed_steps: [],
      personal_info: {
        name: user?.user_metadata?.name || "",
        email: user?.email || "",
        ddi: "+55",
        phone: "",
        linkedin: "",
        instagram: "",
        country: "Brasil",
        state: "",
        city: "",
        timezone: "America/Sao_Paulo"
      },
      professional_info: {},
      business_context: {},
      business_goals: {},
      ai_experience: {},
      experience_personalization: {},
      complementary_info: {}
    };

    // Inserir o registro no banco
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert(initialData)
      .select()
      .single();

    if (error) {
      console.error("[ERRO] Erro ao criar progresso inicial:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao criar progresso inicial:", e);
    return { data: null, error: e };
  }
}

/**
 * Atualiza o progresso do onboarding
 */
export async function updateOnboardingProgress(progressId: string, data: Partial<OnboardingProgress>) {
  try {
    if (!progressId) {
      throw new Error("ID do progresso não fornecido");
    }

    // Garantir que o campo last_sync_at seja atualizado
    const updateData = {
      ...data,
      last_sync_at: new Date().toISOString(),
      sync_status: 'pendente',
      updated_at: new Date().toISOString()
    };

    // Atualizar o registro no banco
    const { data: updatedData, error } = await supabase
      .from('onboarding_progress')
      .update(updateData)
      .eq('id', progressId)
      .select('*')
      .single();

    if (error) {
      console.error("[ERRO] Erro ao atualizar progresso:", error);
      return { data: null, error };
    }

    return { data: updatedData, error: null };
  } catch (e) {
    console.error("[ERRO] Exceção ao atualizar progresso:", e);
    return { data: null, error: e };
  }
}
