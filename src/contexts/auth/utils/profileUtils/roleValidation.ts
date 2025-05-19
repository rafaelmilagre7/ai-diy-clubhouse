
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase/types";

// Função para validar o papel do usuário baseado no email
export const validateUserRole = async (profile: UserProfile): Promise<boolean> => {
  if (!profile || !profile.email) return false;
  
  try {
    const { data, error } = await supabase.rpc('validateuserrole', {
      profileid: profile.id,
      currentrole: profile.role || 'member',
      email: profile.email
    });
    
    if (error) {
      console.error('Erro ao validar papel do usuário:', error);
      return false;
    }
    
    // Se o papel mudou, atualizar o estado local
    if (data && data !== profile.role) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao validar papel do usuário:', error);
    return false;
  }
};
