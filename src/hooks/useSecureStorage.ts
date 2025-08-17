
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

// ❌ HOOK DEPRECIADO - VULNERABILIDADE DE SEGURANÇA ❌
//
// Este hook usava 'advancedEncryption' que é apenas base64 (criptografia falsa)
// 
// 🚨 RISCO: Dados facilmente expostos - atob(dados) = dados em texto claro
// ✅ SUBSTITUTO SEGURO: useSecureTokenStorage com AES-256-GCM real
//
// @deprecated Este hook é uma VULNERABILIDADE - use useSecureTokenStorage
export const useSecureStorage = (key: string, defaultValue?: any) => {
  // ❌ BLOQUEIO DE SEGURANÇA - Hook vulnerável detectado
  
  console.error(`
🚨 VULNERABILIDADE CRÍTICA DETECTADA 🚨

Tentativa de uso do useSecureStorage (INSEGURO):
❌ Hook usa criptografia FALSA (apenas base64)
❌ Dados facilmente expostos: atob(dados) = dados em texto claro
❌ Qualquer atacante pode decodificar os dados

🔒 MIGRAÇÃO OBRIGATÓRIA:
  // ❌ Remover:
  import { useSecureStorage } from '@/hooks/useSecureStorage';
  
  // ✅ Usar:
  import { useSecureTokenStorage } from '@/hooks/useSecureTokenStorage';
  
  const { value, setValue } = useSecureTokenStorage('${key}', defaultValue, {
    autoMigrate: true // Migra dados antigos automaticamente
  });

⚠️  BLOQUEANDO execução por segurança.
  `);
  
  // Mostrar toast de erro
  setTimeout(() => {
    toast({
      title: "🚨 Vulnerabilidade de Segurança",
      description: "Hook useSecureStorage bloqueado. Use useSecureTokenStorage com AES-256-GCM.",
      variant: "destructive",
    });
  }, 100);

  throw new Error('🚨 useSecureStorage bloqueado por vulnerabilidade. Use useSecureTokenStorage com AES-256-GCM real.');
};
