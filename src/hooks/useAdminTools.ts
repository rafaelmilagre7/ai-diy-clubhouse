
import { useState, useMemo } from 'react';
import { Tool } from '@/types/toolTypes';
import { ToolCategory } from '@/components/admin/tools/AdminToolsFilters';

export function useAdminTools(initialTools: Tool[] = []) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(null);

  const tools = useMemo(() => {
    return initialTools.filter((tool) => {
      // Filtro por busca
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtro por categoria
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [initialTools, searchQuery, selectedCategory]);

  return {
    tools,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  };
}
