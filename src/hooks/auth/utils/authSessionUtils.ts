
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';

export const processUserProfile = async (user: User | string): Promise<UserProfile | null> => {
  // Extrair o ID do usuário dependendo do tipo do parâmetro
  const userId = typeof user === 'string' ? user : user?.id;
  
  if (!userId) return null;
  
  try {
    console.log("Buscando perfil para usuário:", userId);
    
    // Primeiro tenta buscar perfil pelo id diretamente (forma correta)
    const { data: profileDataById, error: profileErrorById } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (!profileErrorById && profileDataById) {
      console.log("Perfil encontrado pelo id:", profileDataById);
      return profileDataById as UserProfile;
    }
    
    console.log("Perfil não encontrado pelo id, tentando criar um novo perfil");
    
    // Se não encontrou perfil, vamos tentar criar um
    try {
      // Obter dados do usuário se temos apenas o ID
      let userData = typeof user !== 'string' ? user : null;
      
      if (!userData) {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) throw authError;
        userData = authUser.user;
      }
      
      // Determinar o papel com base no email
      const isAdmin = userData?.email?.includes('@viverdeia.ai') || 
                       userData?.email === 'admin@teste.com' ||
                       userData?.email === 'admin@viverdeia.ai';
      
      // Criar perfil
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          name: userData?.user_metadata?.name || userData?.email?.split('@')[0] || 'Usuário',
          email: userData?.email,
          role: isAdmin ? 'admin' : 'member'
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Erro ao criar perfil:", createError);
        return null;
      }
      
      console.log("Novo perfil criado:", newProfile);
      return newProfile as UserProfile;
    } catch (createError) {
      console.error("Erro ao criar perfil para usuário:", createError);
      return null;
    }
  } catch (error) {
    console.error("Erro inesperado ao processar perfil de usuário:", error);
    return null;
  }
};
