
import { supabase } from "@/lib/supabase";
import { PersonalInfoData } from "@/types/onboarding";
import { useLogging } from "@/hooks/useLogging";

/**
 * Busca os dados pessoais para um progresso específico
 */
export const fetchPersonalInfoData = async (progressId: string) => {
  try {
    const { data, error } = await supabase
      .from("onboarding_personal_info")
      .select("*")
      .eq("progress_id", progressId)
      .maybeSingle();

    if (error) {
      console.error("[ERRO] Erro ao buscar dados pessoais:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[ERRO] Exceção ao buscar dados pessoais:", err);
    return null;
  }
};

/**
 * Formata os dados pessoais para o formato esperado pelo frontend
 */
export const formatPersonalInfoData = (data: any) => {
  if (!data) return {};

  // Garantir que DDI está formatado corretamente
  let ddi = data.ddi || "+55";
  if (ddi && !ddi.startsWith('+')) {
    ddi = '+' + ddi;
  }

  return {
    personal_info: {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      ddi: ddi,
      linkedin: data.linkedin || "",
      instagram: data.instagram || "",
      country: data.country || "Brasil",
      state: data.state || "",
      city: data.city || "",
      timezone: data.timezone || "GMT-3"
    }
  };
};

/**
 * Salva dados pessoais em sua própria tabela
 */
export const savePersonalInfoData = async (
  progressId: string, 
  userId: string, 
  data: PersonalInfoData,
  logError: ReturnType<typeof useLogging>["logError"]
) => {
  if (!progressId || !userId) {
    console.error("[ERRO] IDs inválidos para salvar dados pessoais");
    return { success: false, error: "IDs inválidos" };
  }

  try {
    // Verificar se já existe um registro para este progresso
    const { data: existingData } = await supabase
      .from("onboarding_personal_info")
      .select("id")
      .eq("progress_id", progressId)
      .maybeSingle();

    // Preparar dados formatados para persistência
    // Garantir formatação adequada para o DDI
    let formattedDDI = data.ddi || "+55";
    if (formattedDDI && !formattedDDI.startsWith('+')) {
      formattedDDI = '+' + formattedDDI;
    }

    const personalData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      ddi: formattedDDI,
      linkedin: data.linkedin,
      instagram: data.instagram,
      country: data.country || "Brasil",
      state: data.state,
      city: data.city,
      timezone: data.timezone || "GMT-3",
      updated_at: new Date().toISOString()
    };

    let result;
    
    if (existingData) {
      // Atualizar registro existente
      console.log("[DEBUG] Atualizando dados pessoais existentes");
      result = await supabase
        .from("onboarding_personal_info")
        .update(personalData)
        .eq("progress_id", progressId)
        .select()
        .single();
    } else {
      // Criar novo registro
      console.log("[DEBUG] Inserindo novos dados pessoais");
      result = await supabase
        .from("onboarding_personal_info")
        .insert({
          ...personalData,
          progress_id: progressId,
          user_id: userId
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("[ERRO] Erro ao salvar dados pessoais:", result.error);
      logError("personal_info_save_error", {
        error: result.error.message,
        progressId
      });
      return { success: false, error: result.error };
    }

    // Atualizar também o campo JSONB na tabela principal para compatibilidade
    const { error: updateError } = await supabase
      .from("onboarding_progress")
      .update({
        personal_info: {
          ...personalData,
          _last_updated: new Date().toISOString()
        }
      })
      .eq("id", progressId);

    if (updateError) {
      console.warn("[AVISO] Erro ao atualizar dados no campo JSONB:", updateError);
      // Não falhar completamente se apenas a atualização do campo JSONB falhar
    }

    return { success: true, data: result.data };
  } catch (err) {
    console.error("[ERRO] Exceção ao salvar dados pessoais:", err);
    logError("personal_info_save_exception", {
      error: err instanceof Error ? err.message : String(err),
      progressId
    });
    return { success: false, error: err };
  }
};
