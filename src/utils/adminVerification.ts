
import { supabase } from '@/lib/supabase';
import { logger } from './logger';

// Cache de verificações admin com TTL de 5 minutos
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Verificação centralizada de status de admin
 * Esta é a única fonte de verdade para verificação de admin
 */
export const verifyAdminStatus = async (userId: string, email?: string): Promise<boolean> => {
  if (!userId || typeof userId !== 'string') {
    logger.warn('ID de usuário inválido para verificação admin', {
      component: 'ADMIN_VERIFICATION'
    });
    return false;
  }

  // Verificar cache primeiro
  const cached = adminCache.get(userId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < ADMIN_CACHE_TTL) {
    return cached.isAdmin;
  }

  try {
    // Verificação por emails confiáveis
    if (email) {
      const trustedEmails = [
        'rafael@viverdeia.ai',
        'admin@viverdeia.ai'
      ];
      
      // Apenas em desenvolvimento, permitir admin@teste.com
      if (process.env.NODE_ENV === 'development') {
        trustedEmails.push('admin@teste.com');
      }
      
      if (trustedEmails.includes(email.toLowerCase())) {
        adminCache.set(userId, { isAdmin: true, timestamp: now });
        logger.info('Admin verificado por email confiável', {
          component: 'ADMIN_VERIFICATION',
          userId: userId.substring(0, 8) + '***'
        });
        return true;
      }
    }

    // Verificação no banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error('Erro na verificação admin no banco', {
        component: 'ADMIN_VERIFICATION',
        error: error.message,
        userId: userId.substring(0, 8) + '***'
      });
      return false;
    }
    
    const isAdmin = data?.role === 'admin';
    
    // Cache do resultado
    adminCache.set(userId, { isAdmin, timestamp: now });
    
    if (isAdmin) {
      logger.info('Admin verificado pelo banco de dados', {
        component: 'ADMIN_VERIFICATION',
        userId: userId.substring(0, 8) + '***'
      });
    }
    
    return isAdmin;
    
  } catch (error) {
    logger.error('Erro na verificação de admin', {
      component: 'ADMIN_VERIFICATION',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      userId: userId.substring(0, 8) + '***'
    });
    return false;
  }
};

/**
 * Limpar cache de admin (usar quando usuário faz logout ou muda role)
 */
export const clearAdminCache = (userId?: string) => {
  if (userId) {
    adminCache.delete(userId);
    logger.info('Cache admin limpo para usuário', {
      component: 'ADMIN_VERIFICATION',
      userId: userId.substring(0, 8) + '***'
    });
  } else {
    adminCache.clear();
    logger.info('Cache admin completamente limpo', {
      component: 'ADMIN_VERIFICATION'
    });
  }
};

/**
 * Hook para verificação de admin (para componentes React)
 */
export const useAdminVerification = () => {
  return {
    verifyAdminStatus,
    clearAdminCache
  };
};
