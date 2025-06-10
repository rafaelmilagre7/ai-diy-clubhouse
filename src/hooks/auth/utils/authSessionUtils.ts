
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';

// Cache para evitar buscas desnecessárias
const profileCache = new Map<string, UserProfile | null>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
    cacheExpiry.delete(userId);
  } else {
    profileCache.clear();
    cacheExpiry.clear();
  }
};

const isCacheValid = (userId: string): boolean => {
  const expiry = cacheExpiry.get(userId);
  return expiry ? Date.now() < expiry : false;
};

export const processUserProfile = async (
  userId: string, 
  userEmail?: string | null,
  userName?: string
): Promise<UserProfile | null> => {
  try {
    // Verificar cache primeiro
    if (isCacheValid(userId) && profileCache.has(userId)) {
      console.log(`🔄 [AUTH] Perfil encontrado no cache: ${userId.substring(0, 8)}***`);
      return profileCache.get(userId) || null;
    }

    console.log(`🔍 [AUTH] Buscando perfil no banco: ${userId.substring(0, 8)}***`);

    // Query otimizada com timeout
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        avatar_url,
        company_name,
        industry,
        created_at,
        role_id,
        onboarding_completed,
        onboarding_completed_at,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`👤 [AUTH] Perfil não encontrado, criando: ${userId.substring(0, 8)}***`);
        return await createUserProfile(userId, userEmail, userName);
      }
      console.error('❌ [AUTH] Erro ao buscar perfil:', error);
      return null;
    }

    // Mapear dados do perfil
    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email || userEmail || '',
      name: profile.name || userName || '',
      avatar_url: profile.avatar_url,
      company_name: profile.company_name,
      industry: profile.industry,
      created_at: profile.created_at,
      role_id: profile.role_id,
      user_roles: profile.user_roles as any,
      onboarding_completed: profile.onboarding_completed || false,
      onboarding_completed_at: profile.onboarding_completed_at
    };

    // CORREÇÃO CRÍTICA: Atualizar user_metadata com role
    const roleName = getUserRoleName(userProfile);
    if (roleName) {
      try {
        console.log(`🔄 [AUTH] Atualizando user_metadata com role: ${roleName}`);
        await supabase.auth.updateUser({
          data: { role: roleName }
        });
        console.log(`✅ [AUTH] User_metadata atualizado com sucesso: role=${roleName}`);
      } catch (metadataError) {
        console.warn('⚠️ [AUTH] Erro ao atualizar user_metadata:', metadataError);
        // Não é crítico, continuar
      }
    }

    // Atualizar cache
    profileCache.set(userId, userProfile);
    cacheExpiry.set(userId, Date.now() + CACHE_DURATION);

    console.log(`✅ [AUTH] Perfil processado: role=${roleName || 'undefined'}`);
    return userProfile;

  } catch (error) {
    console.error('❌ [AUTH] Erro crítico no processamento do perfil:', error);
    return null;
  }
};

const createUserProfile = async (
  userId: string, 
  userEmail?: string | null,
  userName?: string
): Promise<UserProfile | null> => {
  try {
    // Buscar role padrão (member)
    const { data: defaultRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'member')
      .single();

    const newProfile = {
      id: userId,
      email: userEmail || '',
      name: userName || '',
      role_id: defaultRole?.id || null,
      onboarding_completed: false
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select(`
        id,
        email,
        name,
        avatar_url,
        company_name,
        industry,
        created_at,
        role_id,
        onboarding_completed,
        onboarding_completed_at,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .single();

    if (error) {
      console.error('❌ [AUTH] Erro ao criar perfil:', error);
      return null;
    }

    // CORREÇÃO: Atualizar user_metadata para novo usuário
    try {
      await supabase.auth.updateUser({
        data: { role: 'member' }
      });
      console.log('✅ [AUTH] User_metadata definido para novo usuário: role=member');
    } catch (metadataError) {
      console.warn('⚠️ [AUTH] Erro ao definir user_metadata inicial:', metadataError);
    }

    const userProfile: UserProfile = {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      avatar_url: data.avatar_url,
      company_name: data.company_name,
      industry: data.industry,
      created_at: data.created_at,
      role_id: data.role_id,
      user_roles: data.user_roles as any,
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at
    };

    console.log(`✅ [AUTH] Perfil criado com sucesso: ${userId.substring(0, 8)}***`);
    return userProfile;

  } catch (error) {
    console.error('❌ [AUTH] Erro ao criar perfil:', error);
    return null;
  }
};

// Função para obter nome do role a partir do perfil
const getUserRoleName = (profile: UserProfile | null): string | null => {
  if (!profile?.user_roles) return null;
  
  if (Array.isArray(profile.user_roles)) {
    return profile.user_roles[0]?.name || null;
  }
  
  if (typeof profile.user_roles === 'object' && profile.user_roles.name) {
    return profile.user_roles.name;
  }
  
  return null;
};
