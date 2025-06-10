
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// Cache do perfil com expiração para evitar chamadas excessivas
let profileCache: { profile: any; timestamp: number; userId: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const clearProfileCache = () => {
  profileCache = null;
  logger.info('[AUTH-SESSION] Cache de perfil limpo');
};

// CORREÇÃO CRÍTICA: Função segura para buscar perfil com validação rigorosa
export const fetchUserProfileSecurely = async (userId: string) => {
  if (!userId) {
    logger.warn('[AUTH-SESSION] Tentativa de buscar perfil sem userId');
    throw new Error('User ID é obrigatório');
  }

  // Verificar cache válido
  if (profileCache && 
      profileCache.userId === userId && 
      Date.now() - profileCache.timestamp < CACHE_DURATION) {
    logger.info('[AUTH-SESSION] Perfil obtido do cache');
    return profileCache.profile;
  }

  try {
    logger.info('[AUTH-SESSION] Buscando perfil do usuário no banco de dados');
    
    // CORREÇÃO CRÍTICA: Usar RLS - apenas o próprio usuário pode ver seu perfil
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('[AUTH-SESSION] Erro ao buscar perfil:', error);
      
      // Se for erro de acesso negado, limpar cache e session
      if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
        logger.warn('[AUTH-SESSION] Acesso negado pelo RLS - possível violação de segurança');
        clearProfileCache();
        throw new Error('Acesso negado aos dados do perfil');
      }
      
      throw error;
    }

    if (!data) {
      logger.warn('[AUTH-SESSION] Perfil não encontrado para o usuário');
      return null;
    }

    // CORREÇÃO CRÍTICA: Validar integridade dos dados do perfil
    if (data.id !== userId) {
      logger.error('[AUTH-SESSION] ALERTA DE SEGURANÇA: ID do perfil não confere com usuário autenticado', {
        expectedUserId: userId,
        profileUserId: data.id
      });
      throw new Error('Violação de segurança detectada');
    }

    // Atualizar cache
    profileCache = {
      profile: data,
      timestamp: Date.now(),
      userId: userId
    };

    logger.info('[AUTH-SESSION] Perfil carregado e cache atualizado', {
      userId: userId.substring(0, 8) + '***',
      hasRole: !!data.user_roles,
      roleName: data.user_roles?.name || 'sem role'
    });

    return data;

  } catch (error) {
    logger.error('[AUTH-SESSION] Erro crítico ao buscar perfil:', error);
    
    // Em caso de erro crítico, limpar cache para forçar nova busca
    clearProfileCache();
    throw error;
  }
};

// CORREÇÃO CRÍTICA: Função para validar sessão com logs de segurança
export const validateUserSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('[AUTH-SESSION] Erro ao validar sessão:', error);
      return { session: null, user: null };
    }

    if (!session || !session.user) {
      logger.info('[AUTH-SESSION] Nenhuma sessão ativa encontrada');
      return { session: null, user: null };
    }

    // CORREÇÃO CRÍTICA: Validar integridade da sessão
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      logger.warn('[AUTH-SESSION] Sessão expirada detectada');
      await supabase.auth.signOut();
      return { session: null, user: null };
    }

    logger.info('[AUTH-SESSION] Sessão validada com sucesso', {
      userId: session.user.id.substring(0, 8) + '***',
      email: session.user.email?.substring(0, 3) + '***'
    });

    return { session, user: session.user };

  } catch (error) {
    logger.error('[AUTH-SESSION] Erro crítico na validação de sessão:', error);
    
    // Em caso de erro crítico, fazer logout por segurança
    try {
      await supabase.auth.signOut();
    } catch (logoutError) {
      logger.error('[AUTH-SESSION] Erro ao fazer logout de emergência:', logoutError);
    }
    
    return { session: null, user: null };
  }
};

// NOVA FUNÇÃO: Processar perfil de usuário com criação automática se necessário
export const processUserProfile = async (userId: string, email?: string, name?: string) => {
  try {
    let profile = await fetchUserProfileSecurely(userId);
    
    // Se perfil não existe, criar um básico
    if (!profile) {
      logger.info('[AUTH-SESSION] Criando perfil básico para novo usuário');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          name: name || email?.split('@')[0] || 'Usuário',
          role_id: null // Role será definido posteriormente
        })
        .select(`
          *,
          user_roles:role_id(*)
        `)
        .single();
      
      if (createError) {
        logger.error('[AUTH-SESSION] Erro ao criar perfil:', createError);
        throw createError;
      }
      
      profile = newProfile;
      
      // Atualizar cache com novo perfil
      profileCache = {
        profile: newProfile,
        timestamp: Date.now(),
        userId: userId
      };
    }
    
    return profile;
  } catch (error) {
    logger.error('[AUTH-SESSION] Erro ao processar perfil:', error);
    throw error;
  }
};
