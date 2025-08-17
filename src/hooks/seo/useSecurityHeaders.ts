
/**
 * ❌ HOOK DEPRECIADO - CSP INSEGURA ❌
 *
 * Este hook usa implementação vulnerável de CSP
 * 
 * 🚨 BLOQUEADO POR SEGURANÇA
 * ✅ USE: SecurityProvider (já ativado automaticamente)
 */

import { useEffect } from 'react';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Bloquear uso e orientar migração
    console.error(`
🚨 HOOK CSP INSEGURO DETECTADO 🚨

Tentativa de uso do useSecurityHeaders (VULNERÁVEL):
❌ Hook usa CSP com 'unsafe-inline'
❌ Permite ataques XSS

🔒 SISTEMA SEGURO JÁ ATIVO:
✅ SecurityProvider com CSP segura já está funcionando
✅ Nonces seguros já implementados
✅ Monitoramento de violações ativo

⚠️  Remova este hook - segurança já garantida.
    `);
    
    // Mostrar toast de migração
    setTimeout(() => {
      toast({
        title: "🚨 Hook de Segurança Depreciado",
        description: "CSP segura já está ativa via SecurityProvider. Remova useSecurityHeaders.",
        variant: "destructive",
      });
    }, 100);

    logger.warn('useSecurityHeaders BLOQUEADO - use SecurityProvider', {
      component: 'DEPRECATED_USE_SECURITY_HEADERS',
      migration: 'SecurityProvider já ativo automaticamente'
    });
  }, []);
};
