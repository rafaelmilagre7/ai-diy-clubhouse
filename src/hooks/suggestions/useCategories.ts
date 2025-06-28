
import { useState, useEffect } from 'react';

export interface SuggestionCategory {
  id: string;
  name: string;
  description?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<SuggestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock categories
    const mockCategories: SuggestionCategory[] = [
      { id: '1', name: 'Funcionalidades', description: 'Sugestões de novas funcionalidades' },
      { id: '2', name: 'Melhorias', description: 'Melhorias em funcionalidades existentes' },
      { id: '3', name: 'Bugs', description: 'Relatórios de problemas técnicos' },
      { id: '4', name: 'Interface', description: 'Sugestões de melhorias na interface' }
    ];

    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    categories,
    isLoading,
    error: null
  };
};
