
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const validateUserSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao validar sessão:', error);
      return { session: null, user: null };
    }
    
    return { 
      session, 
      user: session?.user || null 
    };
  } catch (error) {
    console.error('Erro crítico na validação:', error);
    return { session: null, user: null };
  }
};

export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (*)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Erro crítico ao buscar perfil:', error);
    return null;
  }
};

export const processUserProfile = async (
  userId: string,
  userEmail?: string,
  userName?: string
): Promise<UserProfile | null> => {
  try {
    let profile = await fetchUserProfileSecurely(userId);
    
    // Se não há perfil, criar um básico
    if (!profile && userEmail) {
      console.log('Criando perfil para novo usuário:', userEmail);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          user_roles (*)
        `)
        .single();
      
      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        return null;
      }
      
      profile = newProfile as UserProfile;
    }
    
    return profile;
  } catch (error) {
    console.error('Erro no processamento:', error);
    return null;
  }
};

export const clearProfileCache = () => {
  // Cache removido - função vazia para compatibilidade
};
