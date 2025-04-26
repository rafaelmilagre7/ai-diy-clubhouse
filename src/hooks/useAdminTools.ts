
import { useState, useMemo } from 'react';
import { useTools } from '@/hooks/useTools';
import { Tool, ToolCategory } from '@/types/toolTypes';

export const useAdminTools = (initialTools: Tool[] = []) => {
  // Usar as ferramentas iniciais se fornecidas, caso contrário buscar
  const { tools: fetchedTools, isLoading, error, refetch } = useTools();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Usar as ferramentas passadas como prop ou as buscadas do hook
  const baseTools = initialTools.length > 0 ? initialTools : fetchedTools;

  const filteredTools = useMemo(() => {
    let result = [...baseTools];
    
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
  }, [baseTools, selectedCategory, searchQuery]);

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
