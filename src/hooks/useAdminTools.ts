
import { useState, useMemo } from 'react';
import { useTools } from '@/hooks/useTools';
import { Tool, ToolCategory } from '@/types/toolTypes';

export const useAdminTools = () => {
  const { tools, isLoading, error, refetch } = useTools();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    let result = [...tools];
    
    // Filtrar por categoria
    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }
    
    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }
    
    // Ordenar alfabeticamente
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [tools, selectedCategory, searchQuery]);

  return {
    tools: filteredTools,
    isLoading,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  };
};
