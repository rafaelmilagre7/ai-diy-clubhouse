
import { supabase, UserProfile } from "@/lib/supabase";
import { createUserProfileIfNeeded, fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { validateUserRole } from "@/contexts/auth/utils/profileUtils/roleValidation";

// Cache otimizado com controle de loading
const profileCache = new Map<string, { 
  profile: UserProfile | null; 
  timestamp: number; 
  promise?: Promise<UserProfile | null>;
  isLoading: boolean;
}>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos aumentado

/**
 * Processa o perfil do usuário de forma otimizada com cache melhorado
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
    
    // Retornar cache válido e não em loading
    if (cached && !cached.isLoading && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.profile;
    }
    
    // Se há uma promise em andamento, aguardar ela
    if (cached?.promise && cached.isLoading) {
      try {
        return await cached.promise;
      } catch (error) {
        // Se a promise falhar, continuar com nova tentativa
        console.warn("Promise em cache falhou, tentando novamente");
      }
    }
    
    // Marcar como carregando
    profileCache.set(userId, { 
      profile: cached?.profile || null, 
      timestamp: now, 
      isLoading: true 
    });
    
    // Criar nova promise e cachear ela
    const profilePromise = fetchUserProfileOptimized(userId, email, name);
    profileCache.set(userId, { 
      profile: cached?.profile || null, 
      timestamp: now, 
      promise: profilePromise,
      isLoading: true 
    });
    
    const profile = await profilePromise;
    
    // Atualizar cache com resultado
    profileCache.set(userId, { 
      profile, 
      timestamp: now,
      isLoading: false 
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
 * Função otimizada para buscar perfil com upsert melhorado
 */
const fetchUserProfileOptimized = async (
  userId: string, 
  email: string | undefined | null, 
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    // Tentar buscar perfil existente primeiro com timeout
    const fetchPromise = fetchUserProfile(userId);
    const timeoutPromise = new Promise<UserProfile | null>((_, reject) => 
      setTimeout(() => reject(new Error('Fetch profile timeout')), 3000)
    );
    
    let profile = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Se não encontrou, criar usando upsert
    if (!profile && email) {
      profile = await createUserProfileIfNeeded(userId, email, name || "Usuário");
    }
    
    // Verificar role apenas em desenvolvimento
    if (profile?.role && process.env.NODE_ENV === 'development') {
      try {
        const validatedRole = await validateUserRole(profile.id);
        if (validatedRole !== profile.role) {
          profile.role = validatedRole as any;
        }
      } catch (roleError) {
        console.warn("Erro ao validar role do usuário:", roleError);
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao buscar perfil otimizado:", error);
    
    // Em caso de erro, retornar fallback
    return createFallbackProfile(userId, email, name);
  }
};

/**
 * Cria perfil fallback melhorado
 */
const createFallbackProfile = (
  userId: string, 
  email: string | undefined | null, 
  name: string | undefined | null
): UserProfile => {
  console.log(`Criando perfil fallback para ${email || userId}`);
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
 * Inicializa perfil com upsert otimizado
 */
export const initializeNewProfile = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    const role = 'membro_club';
    
    // Usar upsert com timeout
    const upsertPromise = supabase
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
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upsert timeout')), 3000)
    );
    
    const { data, error } = await Promise.race([upsertPromise, timeoutPromise]) as any;
    
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
 * Limpa o cache de perfis
 */
export const clearProfileCache = () => {
  profileCache.clear();
};
