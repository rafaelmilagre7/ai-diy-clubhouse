
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Profile } from "@/types/forumTypes";

export interface CommunityMemberFilters {
  search?: string;
  industry?: string;
  role?: string;
  onlyAvailableForNetworking?: boolean;
}

export const useCommunityMembers = (initialFilters: CommunityMemberFilters = {}) => {
  const [filters, setFilters] = useState<CommunityMemberFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  
  // Buscar indústrias e cargos disponíveis dos dados reais
  const { data: availableOptions } = useQuery({
    queryKey: ['community-members-options'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('industry, current_position')
        .not('industry', 'is', null)
        .not('current_position', 'is', null);
      
      const industries = [...new Set(profiles?.map(p => p.industry).filter(Boolean))] as string[];
      const roles = [...new Set(profiles?.map(p => p.current_position).filter(Boolean))] as string[];
      
      return { industries, roles };
    }
  });
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['community-members', filters, page],
    queryFn: async () => {
      const currentUser = await supabase.auth.getUser();
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.data.user?.id || '')
        .not('name', 'is', null);
        
      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }
      
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      
      if (filters.role) {
        query = query.eq('current_position', filters.role);
      }
      
      if (filters.onlyAvailableForNetworking) {
        query = query.eq('available_for_networking', true);
      }
      
      // Contar total primeiro
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', currentUser.data.user?.id || '')
        .not('name', 'is', null);
        
      // Aplicar os mesmos filtros para contagem
      if (filters.search) {
        countQuery = countQuery.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }
      if (filters.industry) {
        countQuery = countQuery.eq('industry', filters.industry);
      }
      if (filters.role) {
        countQuery = countQuery.eq('current_position', filters.role);
      }
      if (filters.onlyAvailableForNetworking) {
        countQuery = countQuery.eq('available_for_networking', true);
      }
      
      const { count } = await countQuery;
      
      // Buscar dados paginados
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      const { data: members, error: dataError } = await query
        .range(start, end)
        .order('name', { ascending: true });
      
      if (dataError) throw dataError;
      
      return {
        members: members as Profile[] || [],
        count: count || 0
      };
    },
    refetchOnWindowFocus: false
  });
  
  const totalPages = Math.ceil((data?.count || 0) / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleFilterChange = (newFilters: CommunityMemberFilters) => {
    setFilters(newFilters);
    setPage(0); // Resetar para primeira página ao filtrar
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  return {
    members: data?.members || [],
    isLoading,
    error,
    isError: !!error,
    filters,
    handleFilterChange,
    currentPage: page,
    totalPages,
    handlePageChange,
    availableIndustries: availableOptions?.industries || [],
    availableRoles: availableOptions?.roles || [],
    handleRetry
  };
};
