
import { useCallback } from 'react';
import { securityHeaders } from '@/utils/securityHeaders';
import { auditLogger } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

// Hook para requisições HTTP seguras
export const useSecureFetch = () => {
  const { user } = useAuth();
  
  const secureFetch = useCallback(async (
    url: string, 
    options: RequestInit = {},
    auditAction?: string
  ): Promise<Response> => {
    try {
      // Aplicar headers de segurança
      const secureOptions = securityHeaders.enhanceFetch(url, options);
      
      // Log da requisição para auditoria
      if (auditAction && user) {
        await auditLogger.logAccessEvent(auditAction, url, {
          method: options.method || 'GET',
          timestamp: new Date().toISOString()
        }, user.id);
      }
      
      // Validar origem se especificada
      if (options.headers && 'Origin' in options.headers) {
        const origin = options.headers['Origin'] as string;
        if (!securityHeaders.validateOrigin(origin)) {
          throw new Error('Origem não autorizada');
        }
      }
      
      logger.info("Requisição segura iniciada", {
        component: 'SECURE_FETCH',
        url: url.substring(0, 100),
        method: options.method || 'GET'
      });
      
      const response = await fetch(url, secureOptions);
      
      // Log de resposta para auditoria
      if (auditAction && user) {
        await auditLogger.logAccessEvent(`${auditAction}_response`, url, {
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        }, user.id);
      }
      
      return response;
    } catch (error) {
      logger.error("Erro na requisição segura", {
        component: 'SECURE_FETCH',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        url: url.substring(0, 100)
      });
      
      // Log de erro para auditoria
      if (auditAction && user) {
        await auditLogger.logSecurityEvent('fetch_error', 'medium', {
          url: url.substring(0, 100),
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
      
      throw error;
    }
  }, [user]);
  
  return { secureFetch };
};
