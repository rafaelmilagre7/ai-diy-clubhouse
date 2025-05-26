
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export interface CommunityMemberFilters {
  search?: string;
  industry?: string;
  role?: string;
}

export const useCommunityMembers = (initialFilters: CommunityMemberFilters = {}) => {
  const [filters, setFilters] = useState<CommunityMemberFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  
  // Dados mockados para indústrias e cargos disponíveis
  const availableIndustries = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'Finanças',
    'Varejo',
    'Marketing',
    'Consultoria',
    'Outros'
  ];
  
  const availableRoles = [
    'CEO',
    'Fundador',
    'Diretor',
    'Gerente',
    'Especialista',
    'Analista',
    'Consultor',
    'Outros'
  ];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['community-members', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('active', true);
        
      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      
      if (filters.role) {
        query = query.eq('current_position', filters.role);
      }
      
      // Paginação
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      // Execute duas consultas separadas: uma para os dados e outra para a contagem
      const { data: members, error: dataError } = await query
        .range(start, end)
        .order('name', { ascending: true });
      
      if (dataError) throw dataError;
      
      // Consulta separada para contagem
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
        
      if (countError) throw countError;
      
      return {
        members: members || [],
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
    currentPage: page, // Renomeado de page para currentPage
    totalPages,
    handlePageChange,
    availableIndustries,
    availableRoles,
    handleRetry
  };
};
