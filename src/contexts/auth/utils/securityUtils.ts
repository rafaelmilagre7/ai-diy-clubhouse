import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Utilitários de segurança centralizados com correções para trabalhar com as novas políticas RLS
 */

// Cache de verificações admin com TTL curto para segurança
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number; attempts: number }>();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Verificação robusta de status de admin usando a função is_admin() do banco
 */
export const verifyAdminStatus = async (userId: string): Promise<boolean> => {
  if (!userId || typeof userId !== 'string') {
    logger.warn('[SECURITY] Invalid userId for admin verification', { userId });
    return false;
  }

  // Verificar cache e controlar tentativas
  const cached = adminCache.get(userId);
  const now = Date.now();
  
  if (cached) {
    // Verificar se ainda está no TTL
    if (now - cached.timestamp < ADMIN_CACHE_TTL) {
      return cached.isAdmin;
    }
    
    // Verificar rate limiting
    if (cached.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      logger.warn('[SECURITY] Too many admin verification attempts for user:', { userId });
      return false;
    }
  }

  try {
    // Incrementar contador de tentativas
    const currentAttempts = (cached?.attempts || 0) + 1;
    adminCache.set(userId, { 
      isAdmin: false, 
      timestamp: now, 
      attempts: currentAttempts 
    });

    // Usar função is_admin() corrigida do banco
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
    
    if (error) {
      logger.error('[SECURITY] Admin verification error:', error, { userId });
      return false;
    }
    
    const isAdmin = !!data;
    
    // Atualizar cache com resultado
    adminCache.set(userId, { 
      isAdmin, 
      timestamp: now, 
      attempts: currentAttempts 
    });
    
    if (isAdmin) {
      logger.info('[SECURITY] Admin verified by database is_admin() function', { userId });
    }
    
    return isAdmin;
    
  } catch (error) {
    logger.error('[SECURITY] Admin verification error:', error, { userId });
    return false;
  }
};

// Cache de permissões com TTL mais curto para segurança
const permissionCache = new Map<string, { permissions: string[], timestamp: number }>();
const PERMISSION_CACHE_TTL = 3 * 60 * 1000; // 3 minutos

/**
 * Busca permissões do usuário com cache seguro
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  if (!userId || typeof userId !== 'string') {
    logger.warn('[SECURITY] Invalid userId for permissions', { userId });
    return [];
  }

  const cached = permissionCache.get(userId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < PERMISSION_CACHE_TTL) {
    return cached.permissions;
  }

  try {
    // Log do acesso às permissões usando a nova função
    try {
      await supabase.rpc('log_security_access', {
        p_table_name: 'user_roles',
        p_operation: 'fetch_permissions',
        p_resource_id: userId
      });
    } catch (auditError) {
      // Ignorar erros de auditoria silenciosamente
    }
    
    const { data, error } = await supabase.from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('id', userId as any)
      .single();
    
    if (error) {
      logger.error('[SECURITY] Permissions fetch error:', error, { userId });
      return [];
    }
    
    let permissions: string[] = [];
    
    // Acesso correto ao campo permissions
    if ((data as any)?.user_roles) {
      try {
        // user_roles pode ser um objeto único ou array, verificar ambos os casos
        const roleData = Array.isArray((data as any).user_roles) ? (data as any).user_roles[0] : (data as any).user_roles;
        
        if (roleData?.permissions) {
          const permObj = roleData.permissions;
          if (typeof permObj === 'object') {
            const permKeys = Object.keys(permObj).filter(key => permObj[key] === true);
            permissions = permKeys;
          }
        }
      } catch (parseError) {
        logger.error('[SECURITY] Permission parsing error:', parseError, { userId });
      }
    }
    
    // Cache apenas se bem-sucedido
    permissionCache.set(userId, { 
      permissions, 
      timestamp: now 
    });
    
    return permissions;
  } catch (error) {
    logger.error('[SECURITY] Permissions error:', error, { userId });
    return [];
  }
};

/**
 * Limpa cache de permissões de forma segura
 */
export const clearPermissionCache = (userId?: string) => {
  try {
    if (userId) {
      permissionCache.delete(userId);
      adminCache.delete(userId);
      logger.info('[SECURITY] Permission cache cleared for user', { userId });
    } else {
      permissionCache.clear();
      adminCache.clear();
      logger.info('[SECURITY] All permission caches cleared');
    }
  } catch (error) {
    logger.error('[SECURITY] Cache clear error:', error);
  }
};

/**
 * Logging seguro de eventos usando a nova função log_security_access
 */
export const logSecurityEvent = async (
  actionType: string,
  resourceType: string,
  resourceId?: string
) => {
  try {
    // Usar a nova função log_security_access implementada
    await supabase.rpc('log_security_access', {
      p_table_name: resourceType,
      p_operation: actionType,
      p_resource_id: resourceId
    });
  } catch (error) {
    logger.error('[SECURITY] Error logging security event:', error, { actionType, resourceType, resourceId });
    // Não falhar operações principais por causa de erros de log
  }
};

/**
 * Validar integridade da sessão
 */
export const validateSessionIntegrity = (session: any): boolean => {
  try {
    if (!session || typeof session !== 'object') return false;
    
    // Verificar campos obrigatórios
    if (!session.access_token || !session.user || !session.user.id) {
      logger.warn('[SECURITY] Session missing required fields');
      return false;
    }
    
    // Verificar expiração
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      logger.warn('[SECURITY] Session expired');
      return false;
    }
    
    // Verificar formato do token (básico)
    if (typeof session.access_token !== 'string' || session.access_token.length < 20) {
      logger.warn('[SECURITY] Invalid token format');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('[SECURITY] Session validation error:', error);
    return false;
  }
};

/**
 * Rate limiting para operações sensíveis
 */
const operationLimits = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (operation: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = `${operation}`;
  
  let limit = operationLimits.get(key);
  
  // Reset se janela expirou
  if (!limit || now > limit.resetTime) {
    limit = { count: 0, resetTime: now + windowMs };
  }
  
  limit.count++;
  operationLimits.set(key, limit);
  
  if (limit.count > maxAttempts) {
    logger.warn(`[SECURITY] Rate limit exceeded for operation: ${operation}`);
    return false;
  }
  
  return true;
};
