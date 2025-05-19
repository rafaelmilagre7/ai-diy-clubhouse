
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';

export const processUserProfile = async (user: User | string): Promise<UserProfile | null> => {
  // Extrair o ID do usuário dependendo do tipo do parâmetro
  const userId = typeof user === 'string' ? user : user?.id;
  
  if (!userId) return null;
  
  try {
    console.log("Buscando perfil para usuário:", userId);
    
    // Primeiro tenta buscar perfil pelo id diretamente
    const { data: profileDataById, error: profileErrorById } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (!profileErrorById && profileDataById) {
      console.log("Perfil encontrado pelo id:", profileDataById);
      return profileDataById as UserProfile;
    }
    
    // Se não encontrou pelo id, tenta buscar usando a coluna user_id
    const { data: profileDataByUserId, error: profileErrorByUserId } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    if (profileErrorByUserId) {
      console.error("Erro ao buscar perfil do usuário:", profileErrorByUserId);
      console.error("Detalhes da consulta:", { userId });
      return null;
    }
    
    if (!profileDataByUserId) {
      console.warn("Perfil do usuário não encontrado");
      return null;
    }
    
    console.log("Perfil encontrado pelo user_id:", profileDataByUserId);
    return profileDataByUserId as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao processar perfil de usuário:", error);
    return null;
  }
};
