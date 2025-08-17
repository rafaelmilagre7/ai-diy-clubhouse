
/**
 * ❌ HOOK FETCH INSEGURO - CSP VULNERÁVEL ❌
 * 
 * Este hook usa CSP insegura com 'unsafe-inline'
 * ✅ USE: fetch nativo (CSP segura já ativa via SecurityProvider)
 */

import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useSecureFetch = () => {
  
  const secureFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // ❌ BLOQUEAR uso inseguro
    console.error(`
🚨 FETCH INSEGURO DETECTADO 🚨

useSecureFetch usa CSP vulnerável com 'unsafe-inline'

🔒 MIGRAÇÃO OBRIGATÓRIA:
  // ❌ Remover:
  const { secureFetch } = useSecureFetch();
  
  // ✅ Usar fetch nativo:
  const response = await fetch(url, options);

✅ CSP segura já protege todas as requisições via SecurityProvider
    `);
    
    // Mostrar toast de orientação
    toast({
      title: "🚨 Fetch Inseguro Bloqueado", 
      description: "Use fetch nativo - CSP já está segura via SecurityProvider.",
      variant: "destructive",
    });
    
    throw new Error('🚨 useSecureFetch bloqueado por vulnerabilidade CSP. Use fetch nativo.');
  }, []);
  
  return { secureFetch };
};
