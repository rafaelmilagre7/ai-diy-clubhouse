
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

// Cache simples para perfis
const profileCache = new Map<string, { profile: UserProfile, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Validação segura de sessão do usuário
 */
export const validateUserSession = async (): Promise<{ session: Session | null; user: User | null }> => {
  try {
    console.log('🔐 [SESSION-VALIDATION] Iniciando validação de sessão');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [SESSION-VALIDATION] Erro ao obter sessão:', error);
      return { session: null, user: null };
    }
    
    if (!session) {
      console.log('ℹ️ [SESSION-VALIDATION] Nenhuma sessão ativa');
      return { session: null, user: null };
    }
    
    const user = session.user;
    if (!user) {
      console.warn('⚠️ [SESSION-VALIDATION] Sessão sem usuário');
      return { session: null, user: null };
    }
    
    console.log('✅ [SESSION-VALIDATION] Sessão válida:', {
      userId: user.id,
      email: user.email,
      sessionExpires: new Date(session.expires_at! * 1000).toISOString()
    });
    
    return { session, user };
  } catch (error) {
    console.error('💥 [SESSION-VALIDATION] Erro crítico na validação:', error);
    return { session: null, user: null };
  }
};

/**
 * Busca segura do perfil do usuário com cache
 */
export const fetchUserProfileSecurely = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`🔍 [PROFILE-SECURE] Buscando perfil para: ${userId}`);
    
    // Verificar cache primeiro
    const cached = profileCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('⚡ [PROFILE-SECURE] Retornando do cache');
      return cached.profile;
    }
    
    // Importar e usar a função robusta
    const { fetchUserProfile } = await import('@/contexts/auth/utils/profileUtils/userProfileFunctions');
    const profile = await fetchUserProfile(userId);
    
    if (profile) {
      // Armazenar no cache
      profileCache.set(userId, {
        profile,
        timestamp: Date.now()
      });
      console.log('💾 [PROFILE-SECURE] Perfil armazenado no cache');
    }
    
    return profile;
  } catch (error) {
    console.error('💥 [PROFILE-SECURE] Erro na busca segura:', error);
    return null;
  }
};

/**
 * Processa o perfil do usuário após login/signup
 */
export const processUserProfile = async (
  userId: string, 
  email?: string | null, 
  name?: string | null
): Promise<UserProfile | null> => {
  try {
    console.log(`⚙️ [PROFILE-PROCESS] Processando perfil para: ${email}`);
    
    // Primeiro tentar buscar perfil existente
    let profile = await fetchUserProfileSecurely(userId);
    
    if (profile) {
      console.log('✅ [PROFILE-PROCESS] Perfil existente encontrado');
      return profile;
    }
    
    // Se não existe, criar novo
    if (email) {
      console.log('🆕 [PROFILE-PROCESS] Criando novo perfil...');
      const { createUserProfileIfNeeded } = await import('@/contexts/auth/utils/profileUtils/userProfileFunctions');
      profile = await createUserProfileIfNeeded(userId, email, name || 'Usuário');
    }
    
    return profile;
  } catch (error) {
    console.error('💥 [PROFILE-PROCESS] Erro no processamento:', error);
    return null;
  }
};

/**
 * Limpa o cache de perfis
 */
export const clearProfileCache = (userId?: string): void => {
  if (userId) {
    profileCache.delete(userId);
    console.log(`🗑️ [CACHE] Cache limpo para usuário: ${userId}`);
  } else {
    profileCache.clear();
    console.log('🗑️ [CACHE] Cache global limpo');
  }
};

/**
 * Invalida cache de perfil específico
 */
export const invalidateProfileCache = (userId: string): void => {
  profileCache.delete(userId);
  console.log(`♻️ [CACHE] Cache invalidado para: ${userId}`);
};
