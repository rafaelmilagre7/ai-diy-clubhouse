/**
 * DEPRECIADO: Content Security Policy (CSP) com unsafe-inline
 * 
 * Este arquivo foi substituído por secureCSP.ts que implementa
 * CSP segura usando nonces ao invés de unsafe-inline
 * 
 * @deprecated Use @/utils/security/secureCSP
 */

import { logger } from '@/utils/logger';

export const CSP_DIRECTIVES = {
  'script-src': [
    "'self'",
    "'unsafe-inline'", // DEPRECIADO - vulnerável a XSS
  ]
};

export const generateCSPString = (isDevelopment: boolean = false): string => {
  logger.warn('generateCSPString está depreciado', {
    component: 'DEPRECATED_CSP',
    message: 'Use generateSecureCSPString from @/utils/security/secureCSP'
  });
  
  return "default-src 'self'"; // CSP básica como fallback
};

export const applyCSP = (): void => {
  logger.warn('applyCSP está depreciado', {
    component: 'DEPRECATED_CSP',
    message: 'Use applySecureCSP from @/utils/security/secureCSP'
  });
};

export const applySecurityHeaders = (): void => {
  logger.warn('applySecurityHeaders está depreciado', {
    component: 'DEPRECATED_CSP',
    message: 'Use SecurityProvider with secure CSP'
  });
};

export const setupCSPMonitoring = (): void => {
  logger.warn('setupCSPMonitoring está depreciado', {
    component: 'DEPRECATED_CSP',
    message: 'Use setupSecureCSPMonitoring from @/utils/security/secureCSP'
  });
};