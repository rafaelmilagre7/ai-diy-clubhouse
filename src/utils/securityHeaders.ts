
/**
 * ❌ ARQUIVO DEPRECIADO - VULNERABILIDADE DE SEGURANÇA ❌
 *
 * Este arquivo contém implementação insegura de CSP com 'unsafe-inline'
 * 
 * 🚨 RISCO: CSP vulnerável permite ataques XSS
 * ✅ SUBSTITUTO SEGURO: SecurityProvider + secureCSP.ts
 *
 * @deprecated Use SecurityProvider com secureCSP.ts
 */

// ❌ BLOQUEIO DE SEGURANÇA - Implementação vulnerável detectada

console.error(`
🚨 IMPLEMENTAÇÃO CSP INSEGURA DETECTADA 🚨

Tentativa de uso do securityHeaders.ts (VULNERÁVEL):
❌ CSP contém 'unsafe-inline' (permite XSS)
❌ Permite execução de scripts inline maliciosos  
❌ Não usa nonces seguros

🔒 MIGRAÇÃO OBRIGATÓRIA:
  // ❌ Remover:
  import { securityHeaders } from '@/utils/securityHeaders';
  
  // ✅ Usar:
  import { SecurityProvider } from '@/components/security/SecurityProvider';
  import { useCSPNonce } from '@/utils/security/secureCSP';

⚠️  BLOQUEANDO uso por segurança.
`);

throw new Error('🚨 securityHeaders.ts bloqueado por vulnerabilidade CSP. Use SecurityProvider + secureCSP.ts');

// Código original comentado para migração:
/*
export class SecurityHeaders {
  // ... implementação insegura com 'unsafe-inline'
}
*/
