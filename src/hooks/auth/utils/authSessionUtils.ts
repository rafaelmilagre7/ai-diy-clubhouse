
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
    
    // Se não encontrou pelo ID, tente buscar por user_id
    const { data: profileDataByUserId, error: profileErrorByUserId } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    if (!profileErrorByUserId && profileDataByUserId) {
      console.log("Perfil encontrado pelo user_id:", profileDataByUserId);
      return profileDataByUserId as UserProfile;
    }
    
    console.log("Perfil não encontrado, tentando criar um novo perfil");
    
    // Se não encontrou perfil, vamos tentar criar um
    try {
      // Obter dados do usuário se temos apenas o ID
      let userData = typeof user !== 'string' ? user : null;
      
      if (!userData) {
        try {
          const { data: authUser, error: authError } = await supabase.auth.getUser(userId);
          if (authError) throw authError;
          userData = authUser.user;
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          // Tentar alternativa com admin.getUserById
          try {
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
            if (authError) throw authError;
            userData = authUser.user;
          } catch (adminError) {
            console.error("Erro ao buscar dados do usuário via admin:", adminError);
            return null;
          }
        }
      }
      
      if (!userData || !userData.email) {
        console.error("Dados do usuário insuficientes para criar perfil");
        return null;
      }
      
      // Determinar o papel com base no email
      const isAdmin = userData.email.includes('@viverdeia.ai') || 
                      userData.email === 'admin@teste.com' ||
                      userData.email === 'admin@viverdeia.ai';
      
      const userName = userData.user_metadata?.name || 
                      userData.user_metadata?.full_name || 
                      userData.email.split('@')[0] || 
                      'Usuário';
      
      // Criar perfil com todos os campos necessários
      const profileData = {
        id: userId,
        name: userName,
        email: userData.email,
        role: isAdmin ? 'admin' : 'member',
        avatar_url: userData.user_metadata?.avatar_url || null
      };
      
      // Criar perfil
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();
      
      if (createError) {
        console.error("Erro ao criar perfil:", createError);
        
        // Última tentativa: verificar se o perfil já existe (pode ser uma corrida de condição)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (existingProfile) {
          console.log("Perfil encontrado após tentativa de criação:", existingProfile);
          return existingProfile as UserProfile;
        }
        
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
