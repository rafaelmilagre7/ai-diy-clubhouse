
import { supabase, UserProfile } from "@/lib/supabase";
import { createUserProfileIfNeeded, fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { validateUserRole } from "@/contexts/auth/utils/profileUtils/roleValidation";

// Cache otimizado para perfis
const profileCache = new Map<string, { 
  profile: UserProfile | null; 
  timestamp: number; 
  promise?: Promise<UserProfile | null> 
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

/**
 * Processa o perfil do usuário de forma otimizada com cache
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.error("ID de usuário não fornecido para processamento de perfil");
      return null;
    }
    
    // Verificar cache primeiro
    const cached = profileCache.get(userId);
    const now = Date.now();
    
    // Retornar cache válido
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.profile;
    }
    
    // Se há uma promise em andamento, aguardar ela
    if (cached?.promise) {
      return await cached.promise;
    }
    
    // Criar nova promise e cachear ela
    const profilePromise = fetchUserProfileOptimized(userId, email, name);
    profileCache.set(userId, { 
      profile: null, 
      timestamp: now, 
      promise: profilePromise 
    });
    
    const profile = await profilePromise;
    
    // Atualizar cache com resultado
    profileCache.set(userId, { 
      profile, 
      timestamp: now 
    });
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    
    // Remover do cache em caso de erro
    profileCache.delete(userId);
    
    // Retornar perfil fallback para não bloquear o login
    return createFallbackProfile(userId, email, name);
  }
};

/**
 * Função otimizada para buscar perfil com upsert
 */
const fetchUserProfileOptimized = async (
  userId: string, 
  email: string | undefined | null, 
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    // Tentar buscar perfil existente primeiro
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrou, criar usando upsert para evitar race conditions
    if (!profile) {
      profile = await createUserProfileIfNeeded(userId, email || "", name || "Usuário");
    }
    
    // Verificar e atualizar o papel do usuário se necessário (apenas se não estiver em produção)
    if (profile?.role && process.env.NODE_ENV === 'development') {
      try {
        const validatedRole = await validateUserRole(profile.id);
        if (validatedRole !== profile.role) {
          profile.role = validatedRole as any;
        }
      } catch (roleError) {
        // Ignorar erros de validação de role para não bloquear o login
        console.warn("Erro ao validar role do usuário:", roleError);
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao buscar perfil otimizado:", error);
    return null;
  }
};

/**
 * Cria perfil fallback para não bloquear o login
 */
const createFallbackProfile = (
  userId: string, 
  email: string | undefined | null, 
  name: string | undefined | null
): UserProfile => {
  return {
    id: userId,
    email: email || '',
    name: name || 'Usuário',
    role: 'membro_club',
    avatar_url: null,
    company_name: null,
    industry: null,
    created_at: new Date().toISOString(),
    onboarding_completed: false,
    onboarding_completed_at: null
  };
};

/**
 * Inicializa um novo perfil com valores padrão (versão otimizada)
 */
export const initializeNewProfile = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    const role = 'membro_club';
    
    // Usar upsert para evitar conflitos
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao inicializar novo perfil:", error);
      return createFallbackProfile(userId, email, name);
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao inicializar perfil:", error);
    return createFallbackProfile(userId, email, name);
  }
};

/**
 * Limpa o cache de perfis (útil para logout)
 */
export const clearProfileCache = () => {
  profileCache.clear();
};
