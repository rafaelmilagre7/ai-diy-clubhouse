
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sanitizeTrailData } from "./utils";
import { ImplementationTrail } from "../useImplementationTrail";

export const useGenerateImplementationTrail = (
  user: any,
  session: any,
  setIsLoading: (v: boolean) => void,
  setError: (v: string | null) => void,
  setDetailedError: (v: any) => void,
  setTrail: (t: ImplementationTrail | null) => void,
  setLastGenerationTime: (d: Date | null) => void
) => {
  return async (onboardingData: any) => {
    if (!user || !session) {
      setError("Usuário não autenticado ou sessão inválida");
      return null;
    }
    try {
      setIsLoading(true);
      setError(null);
      setDetailedError(null);

      const { data: profileData, error: profileError } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (profileError || !profileData || !profileData.is_completed) {
        throw new Error("Perfil de implementação não encontrado ou incompleto");
      }

      await supabase
        .from("implementation_trails")
        .upsert({
          user_id: user.id,
          status: "pending",
          generation_attempts: 1,
          updated_at: new Date().toISOString()
        });

      const authToken = session?.access_token;
      if (!authToken) throw new Error("Token de autenticação não encontrado");

      const { data: generatedData, error: fnError } = await supabase.functions.invoke(
        "generate-implementation-trail",
        {
          body: { onboardingData },
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      setLastGenerationTime(new Date());

      if (fnError) throw fnError;
      if (!generatedData?.recommendations)
        throw new Error("A função de geração retornou uma resposta inválida");

      const recommendationsToSave = generatedData.recommendations;

      await supabase
        .from("implementation_trails")
        .update({
          trail_data: recommendationsToSave,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      const sanitizedData = sanitizeTrailData(recommendationsToSave);
      setTrail(sanitizedData);
      return sanitizedData;
    } catch (error: any) {
      setError("Não foi possível gerar sua trilha.");
      setDetailedError(error);

      if (user?.id) {
        await supabase
          .from("implementation_trails")
          .update({
            status: "error",
            error_message: error.message || "Erro desconhecido",
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
          .eq("status", "pending");
      }
      toast.error("Não foi possível gerar sua trilha.", {
        description: "Tente novamente ou entre em contato com o suporte."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
};
