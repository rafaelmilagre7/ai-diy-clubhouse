import { useState, useCallback } from 'react';
import { contactDataCleaner, type ContactData, type DataCleaningResult } from '@/utils/contactDataCleaner';

export function useContactDataCleaner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleaningResult, setCleaningResult] = useState<DataCleaningResult | null>(null);

  const processContacts = useCallback(async (contacts: ContactData[]): Promise<DataCleaningResult> => {
    setIsProcessing(true);
    
    try {
      // Simula um pequeno delay para mostrar loading em listas grandes
      if (contacts.length > 100) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = contactDataCleaner.processContacts(contacts);
      setCleaningResult(result);
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

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