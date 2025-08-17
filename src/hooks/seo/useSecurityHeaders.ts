
/**
 * DEPRECIADO: useSecurityHeaders
 * 
 * Este hook foi substituído por useSecureHeaders que usa Edge Function
 * e não mais aplica unsafe-inline
 * 
 * @deprecated Use useSecureHeaders from '@/hooks/security/useSecureHeaders'
 */

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export const useSecurityHeaders = () => {
  useEffect(() => {
    logger.warn('useSecurityHeaders está depreciado', {
      component: 'DEPRECATED_USE_SECURITY_HEADERS',
      message: 'Use useSecureHeaders from @/hooks/security/useSecureHeaders'
    });
  }, []);
};
