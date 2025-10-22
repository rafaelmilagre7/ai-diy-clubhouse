import { useState, useCallback } from 'react';
import { contactDataCleaner, type ContactData, type DataCleaningResult } from '@/utils/contactDataCleaner';
import { useRoleMapping } from './useRoleMapping';

export function useContactDataCleaner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleaningResult, setCleaningResult] = useState<DataCleaningResult | null>(null);
  const { getAvailableRoles, loading: rolesLoading } = useRoleMapping();

  const processContacts = useCallback(async (contacts: ContactData[]): Promise<DataCleaningResult> => {
    setIsProcessing(true);
    
    try {
      // Aguardar carregamento dos papéis se ainda estiver carregando
      if (rolesLoading) {
        // Aguarda até 3 segundos pelo carregamento dos papéis
        let attempts = 0;
        while (rolesLoading && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      // Simula um pequeno delay para mostrar loading em listas grandes
      if (contacts.length > 100) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Obter papéis válidos - agora com fallback integrado
      const validRoles = getAvailableRoles();
      
      const result = contactDataCleaner.processContacts(contacts, validRoles);
      setCleaningResult(result);
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [getAvailableRoles, rolesLoading]);

  const clearResults = useCallback(() => {
    setCleaningResult(null);
  }, []);

  return {
    processContacts,
    clearResults,
    isProcessing,
    cleaningResult
  };
}