
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

// Cache para perfis com TTL
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Processa o perfil do usuário com cache otimizado
 */
export const processUserProfile = async (
  userId: string,
  email?: string | null,
  name?: string | null
): Promise<UserProfile | null> => {
  if (!userId) {
    console.warn('[AUTH] processUserProfile: userId é obrigatório');
    return null;
  }

  // Verificar cache primeiro
  const cached = profileCache.get(userId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`🎯 [AUTH] Usando perfil do cache para: ${userId.substring(0, 8)}***`);
    return cached.profile;
  }

  try {
    console.log(`🔍 [AUTH] Buscando perfil no banco para: ${userId.substring(0, 8)}***`);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        role,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
        onboarding_completed,
        onboarding_completed_at,
        user_roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      
      // Se perfil não existe, tentar criar um básico
      if (error.code === 'PGRST116') {
        console.log('[AUTH] Perfil não encontrado, criando perfil básico...');
        return await createBasicProfile(userId, email, name);
      }
      
      return null;
    }

    if (!profile) {
      console.warn('[AUTH] Perfil não encontrado no banco');
      return null;
    }

    // Mapear para o formato esperado
    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email || email || '',
      name: profile.name || name || null,
      role: profile.role || 'membro_club',
      role_id: profile.role_id,
      user_roles: profile.user_roles,
      avatar_url: profile.avatar_url,
      company_name: profile.company_name,
      industry: profile.industry,
      created_at: profile.created_at || new Date().toISOString(),
      onboarding_completed: profile.onboarding_completed || false,
      onboarding_completed_at: profile.onboarding_completed_at,
    };

    // Atualizar cache
    profileCache.set(userId, {
      profile: userProfile,
      timestamp: now
    });

    console.log(`✅ [AUTH] Perfil processado com sucesso: ${userProfile.role}`);
    return userProfile;

  } catch (error) {
    console.error('[AUTH] Erro inesperado ao processar perfil:', error);
    return null;
  }
};

/**
 * Cria um perfil básico para usuário sem perfil
 */
const createBasicProfile = async (
  userId: string,
  email?: string | null,
  name?: string | null
): Promise<UserProfile | null> => {
  try {
    console.log(`🆕 [AUTH] Criando perfil básico para: ${userId.substring(0, 8)}***`);
    
    const profileData = {
      id: userId,
      email: email || '',
      name: name || null,
      role: 'membro_club', // Role padrão
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('[AUTH] Erro ao criar perfil básico:', error);
      return null;
    }

    const userProfile: UserProfile = {
      id: newProfile.id,
      email: newProfile.email || '',
      name: newProfile.name,
      role: newProfile.role || 'membro_club',
      role_id: newProfile.role_id,
      user_roles: null,
      avatar_url: newProfile.avatar_url,
      company_name: newProfile.company_name,
      industry: newProfile.industry,
      created_at: newProfile.created_at,
      onboarding_completed: newProfile.onboarding_completed || false,
      onboarding_completed_at: newProfile.onboarding_completed_at,
    };

    console.log(`✅ [AUTH] Perfil básico criado com sucesso`);
    return userProfile;

  } catch (error) {
    console.error('[AUTH] Erro inesperado ao criar perfil básico:', error);
    return null;
  }
};

/**
 * Limpa o cache de perfil para um usuário específico
 */
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
    console.log(`🧹 [AUTH] Cache de perfil limpo para: ${userId.substring(0, 8)}***`);
  } else {
    profileCache.clear();
    console.log('🧹 [AUTH] Cache de perfil limpo completamente');
  }
};

/**
 * Valida se o perfil tem dados mínimos necessários
 */
export const validateProfile = (profile: any): boolean => {
  return !!(
    profile &&
    profile.id &&
    profile.email &&
    profile.role
  );
};
