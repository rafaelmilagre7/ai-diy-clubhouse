
import { supabase, UserProfile } from "@/lib/supabase";
import { createUserProfileIfNeeded, fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { determineRoleFromEmail, validateUserRole } from "@/contexts/auth/utils/profileUtils/roleValidation";
import { UserRole } from "@/types/supabaseTypes";

/**
 * Processa o perfil do usuário durante a inicialização da sessão
 * Busca o perfil existente ou cria um novo se necessário
 * 
 * @deprecated Use processUserProfile em contexts/auth/utils/profileUtils.ts
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  // Direcionar para a nova implementação para manter compatibilidade
  return await import("@/contexts/auth/utils/profileUtils")
    .then(module => module.processUserProfile(userId, email, name))
    .catch(error => {
      console.error("Erro ao importar novo processUserProfile:", error);
      return null;
    });
};
