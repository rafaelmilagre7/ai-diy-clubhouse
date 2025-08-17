/**
 * DEPRECIADO: Limpeza de configurações CSP legadas
 * 
 * Este arquivo remove configurações CSP antigas e inseguras
 * que usavam unsafe-inline
 */

import { logger } from '@/utils/logger';

export const cleanupLegacyCSP = (): void => {
  // Remover meta tags CSP antigas
  const legacyCSPSelectors = [
    'meta[http-equiv="Content-Security-Policy"]',
    'meta[name="Content-Security-Policy"]'
  ];
  
  legacyCSPSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const content = element.getAttribute('content') || '';
      
      // Se contém unsafe-inline, é legado e deve ser removido
      if (content.includes('unsafe-inline')) {
        logger.warn('Removendo CSP legado com unsafe-inline', {
          component: 'CSP_CLEANUP',
          content: content.substring(0, 100)
        });
        element.remove();
      }
    });
  });
  
  logger.info('Limpeza de CSP legado concluída', {
    component: 'CSP_CLEANUP'
  });
};