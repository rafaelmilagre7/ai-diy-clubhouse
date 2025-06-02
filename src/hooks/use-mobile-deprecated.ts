
/**
 * @deprecated Este arquivo está deprecado. Use useIsMobile do arquivo useResponsive.ts
 * Mantido apenas para compatibilidade com código existente.
 * 
 * Para migrar:
 * - Substitua: import { useIsMobile } from '@/hooks/use-mobile'
 * - Por: import { useIsMobile } from '@/hooks/useResponsive'
 */

import { useIsMobile as useIsMobileNew } from './useResponsive';

export function useIsMobile() {
  return useIsMobileNew();
}
