
import { useState, useMemo } from 'react';
import { useTools } from '@/hooks/useTools';
import { Tool, ToolCategory } from '@/types/toolTypes';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

export const useAdminTools = () => {
  const { tools, isLoading, error, refetch } = useTools();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { handleError, recoverFromError } = useErrorRecovery();

  // OTIMIZAÇÃO: Memoização mais eficiente
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
        tool.description.toLowerCase().includes(query) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Ordenar: ativos primeiro, depois alfabeticamente
    return result.sort((a, b) => {
      // Priorizar ferramentas ativas
      if (a.status !== b.status) {
        return b.status ? 1 : -1;
      }
      // Ordenar alfabeticamente
      return a.name.localeCompare(b.name);
    });
  }, [tools, selectedCategory, searchQuery]);

  // OTIMIZAÇÃO: Função de refresh melhorada
  const refreshTools = async () => {
    try {
      await refetch();
    } catch (refreshError) {
      await handleError(refreshError, 'refresh de ferramentas', {
        queryKeys: [['tools']],
        customMessage: 'Erro ao atualizar lista de ferramentas',
        retryFn: refetch
      });
    }
  };

  // OTIMIZAÇÃO: Função de recuperação de erro
  const recoverFromToolsError = async () => {
    await recoverFromError([['tools']], 'Lista de ferramentas');
  };

  return {
    tools: filteredTools,
    isLoading,
    error,
    refetch: refreshTools,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    recoverFromError: recoverFromToolsError,
    toolsCount: {
      total: tools.length,
      filtered: filteredTools.length,
      active: tools.filter(t => t.status).length,
      inactive: tools.filter(t => !t.status).length
    }
  };
};
