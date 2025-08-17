
/**
 * ❌ CLIENTE HTTP DEPRECIADO - CSP INSEGURA ❌
 * 
 * Este cliente usa headers CSP vulneráveis
 * ✅ USE: fetch nativo (CSP gerenciada pelo SecurityProvider)
 */

import { toast } from '@/hooks/use-toast';

// ❌ BLOQUEIO DE SEGURANÇA
console.error(`
🚨 CLIENTE HTTP INSEGURO DETECTADO 🚨

secureHttpClient usa CSP vulnerável com 'unsafe-inline'

🔒 MIGRAÇÃO:
  // ❌ Remover:
  import { secureHttpClient } from '@/utils/secureHttpClient';
  
  // ✅ Usar fetch nativo:
  const response = await fetch(url, options);

✅ CSP segura já ativa via SecurityProvider
`);

// Mostrar toast de migração
setTimeout(() => {
  toast({
    title: "🚨 Cliente HTTP Inseguro",
    description: "secureHttpClient bloqueado. Use fetch nativo - CSP já está segura.",
    variant: "destructive",
  });
}, 100);

throw new Error('🚨 secureHttpClient bloqueado por vulnerabilidade CSP. Use fetch nativo.');

// Código original comentado para migração:
/*
export const secureHttpClient = {
  // ... implementação com CSP insegura
};
*/
