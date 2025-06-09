
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { sanitizeForLogging } from '@/utils/securityUtils';

/**
 * Processa e valida o perfil do usuário com segurança
 */
export const processUserProfile = async (
  userId: string,
  email?: string | null,
  name?: string | null
): Promise<UserProfile | null> => {
  if (!userId || typeof userId !== 'string') {
    logger.warn("ID de usuário inválido para busca de perfil", {
      component: 'AUTH_SESSION_UTILS'
    });
    return null;
  }

  try {
    // Buscar perfil existente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error("Erro ao buscar perfil existente", {
        error: sanitizeForLogging({ message: fetchError.message }),
        component: 'AUTH_SESSION_UTILS'
      });
      throw fetchError;
    }

    if (existingProfile) {
      logger.info("Perfil existente encontrado", {
        userId: userId.substring(0, 8) + '***',
        role: existingProfile.role,
        component: 'AUTH_SESSION_UTILS'
      });
      return existingProfile;
    }

    // Criar novo perfil se não existir
    if (email) {
      const newProfile: Partial<UserProfile> = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name || 'Usuário',
        role: 'membro_club', // Role padrão seguro
        avatar_url: null,
        company_name: null,
        industry: null,
        onboarding_completed: false,
        onboarding_completed_at: null
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        logger.error("Erro ao criar novo perfil", {
          error: sanitizeForLogging({ message: createError.message }),
          component: 'AUTH_SESSION_UTILS'
        });
        throw createError;
      }

      logger.info("Novo perfil criado com sucesso", {
        userId: userId.substring(0, 8) + '***',
        component: 'AUTH_SESSION_UTILS'
      });

      return createdProfile;
    }

    // Fallback: retornar perfil mínimo
    logger.warn("Criando perfil mínimo como fallback", {
      userId: userId.substring(0, 8) + '***',
      component: 'AUTH_SESSION_UTILS'
    });

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

  } catch (error) {
    logger.error("Erro crítico ao processar perfil do usuário", {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      component: 'AUTH_SESSION_UTILS'
    });
    return null;
  }
};

/**
 * Valida a integridade de uma sessão
 */
export const validateSessionIntegrity = (session: any): boolean => {
  if (!session || typeof session !== 'object') {
    return false;
  }

  // Verificar campos obrigatórios
  if (!session.access_token || !session.user || !session.user.id) {
    logger.warn("Sessão com campos obrigatórios ausentes", {
      component: 'AUTH_SESSION_UTILS'
    });
    return false;
  }

  // Verificar expiração
  if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
    logger.warn("Sessão expirada detectada", {
      component: 'AUTH_SESSION_UTILS'
    });
    return false;
  }

  // Verificar formato básico do token
  if (typeof session.access_token !== 'string' || session.access_token.length < 20) {
    logger.warn("Token com formato inválido", {
      component: 'AUTH_SESSION_UTILS'
    });
    return false;
  }

  return true;
};

/**
 * Limpa dados sensíveis da memória (best effort)
 */
export const secureDataCleanup = (data: any): void => {
  if (!data || typeof data !== 'object') {
    return;
  }

  try {
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        // Substituir strings por valores vazios
        data[key] = '';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        // Recursivamente limpar objetos aninhados
        secureDataCleanup(data[key]);
      }
    });
  } catch (error) {
    // Falhar silenciosamente se não conseguir limpar
    logger.warn("Erro na limpeza segura de dados", {
      component: 'AUTH_SESSION_UTILS'
    });
  }
};
