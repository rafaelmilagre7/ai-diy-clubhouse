import { useState, useMemo } from 'react';
import { useDebouncedState } from '@/hooks/performance/useOptimizedState';
import { Invite } from './types';

interface UseOptimizedInvitesSearchProps {
  invites: Invite[];
  initialPageSize?: number;
}

export const useOptimizedInvitesSearch = ({ 
  invites, 
  initialPageSize = 50 
}: UseOptimizedInvitesSearchProps) => {
  const [searchQuery, debouncedSearchQuery, setSearchQuery] = useDebouncedState('', 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used" | "expired" | "failed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtros otimizados com useMemo
  const filteredInvites = useMemo(() => {
    return invites.filter(invite => {
      // Filtro de texto (usa versão debounced)
      const matchesSearch = debouncedSearchQuery === '' || 
        invite.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (invite.role?.name || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      // Filtro de status
      let matchesStatus = true;
      if (statusFilter !== "all") {
        const isUsed = !!invite.used_at;
        const isExpired = !isUsed && new Date(invite.expires_at) <= new Date();
        const isActive = !isUsed && !isExpired;
        
        // Detectar convites falhados
        const isFailed = (invite as any).delivery_status === 'failed' || 
                        ((invite as any).send_attempts && (invite as any).send_attempts > 3) ||
                        ((invite as any).last_error && !isUsed);
        
        switch (statusFilter) {
          case "used":
            matchesStatus = isUsed;
            break;
          case "expired":
            matchesStatus = isExpired;
            break;
          case "active":
            matchesStatus = isActive;
            break;
          case "failed":
            matchesStatus = isFailed;
            break;
        }
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [invites, debouncedSearchQuery, statusFilter]);

  // Paginação otimizada
  const paginatedInvites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInvites.slice(startIndex, endIndex);
  }, [filteredInvites, currentPage, pageSize]);

  // Estatísticas computadas
  const stats = useMemo(() => {
    const expiredCount = invites.filter(invite => 
      !invite.used_at && new Date(invite.expires_at) <= new Date()
    ).length;

    const failedCount = invites.filter(invite => {
      return (invite as any).delivery_status === 'failed' || 
             ((invite as any).send_attempts && (invite as any).send_attempts > 3) ||
             ((invite as any).last_error && !(invite as any).used_at);
    }).length;

    const totalPages = Math.ceil(filteredInvites.length / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      expiredCount,
      failedCount,
      totalFiltered: filteredInvites.length,
      totalInvites: invites.length,
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex: (currentPage - 1) * pageSize + 1,
      endIndex: Math.min(currentPage * pageSize, filteredInvites.length)
    };
  }, [invites, filteredInvites.length, currentPage, pageSize]);

  // Funções de navegação otimizadas
  const goToPage = (page: number) => {
    if (page >= 1 && page <= stats.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (stats.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (stats.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Reset da pagina quando filtros mudam
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return {
    // Estados
    searchQuery,
    debouncedSearchQuery,
    statusFilter,
    currentPage,
    pageSize,
    
    // Dados
    paginatedInvites,
    filteredInvites,
    stats,
    
    // Ações
    setSearchQuery: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,
    setPageSize,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetFilters,
    
    // Estado de loading da busca
    isSearching: searchQuery !== debouncedSearchQuery
  };
};