
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';

export const processUserProfile = async (user: User | string): Promise<UserProfile | null> => {
  // Extrair o ID do usuário dependendo do tipo do parâmetro
  const userId = typeof user === 'string' ? user : user?.id;
  
  if (!userId) return null;
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    if (profileError) {
      console.error("Erro ao buscar perfil do usuário:", profileError);
      return null;
    }
    
    if (!profileData) {
      console.warn("Perfil do usuário não encontrado");
      return null;
    }
    
    return profileData as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao processar perfil de usuário:", error);
    return null;
  }
};
