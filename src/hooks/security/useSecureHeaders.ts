/**
 * Hook para aplicar headers de segurança via Edge Function
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SecurityHeaders {
  nonce: string;
  headers: Record<string, string>;
  environment: 'development' | 'production';
  timestamp: string;
}

export const useSecureHeaders = () => {
  const [securityHeaders, setSecurityHeaders] = useState<SecurityHeaders | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecurityHeaders = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('security-headers', {
          body: { 
            environment: import.meta.env.DEV ? 'development' : 'production',
            url: window.location.href 
          }
        });

        if (error) {
          throw new Error(`Erro na edge function: ${error.message}`);
        }

        if (data?.success) {
          setSecurityHeaders(data);
          logger.info('Headers de segurança obtidos via Edge Function', {
            component: 'USE_SECURE_HEADERS',
            nonce: data.nonce,
            environment: data.environment
          });
        } else {
          throw new Error('Resposta inválida da edge function');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        logger.error('Erro ao obter headers de segurança', {
          component: 'USE_SECURE_HEADERS',
          error: message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityHeaders();
  }, []);

  return {
    securityHeaders,
    isLoading,
    error,
    nonce: securityHeaders?.nonce || null
  };
};