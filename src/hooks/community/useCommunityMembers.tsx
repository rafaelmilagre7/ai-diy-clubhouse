
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface CommunityMemberFilters {
  search?: string;
  role?: string[];
  skills?: string[];
}

export const useCommunityMembers = (initialFilters: CommunityMemberFilters = {}) => {
  const [filters, setFilters] = useState<CommunityMemberFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['community-members', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('active', true);
        
      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (filters.role && filters.role.length > 0) {
        query = query.in('role', filters.role);
      }
      
      // Para skills (um array)
      if (filters.skills && filters.skills.length > 0) {
        // Supabase permite filtrar por overlaps com arrays
        query = query.overlaps('skills', filters.skills);
      }
      
      // Paginação
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      // Execute duas consultas separadas: uma para os dados e outra para a contagem
      const dataPromise = query
        .range(start, end)
        .order('name', { ascending: true });
      
      const { data, error: dataError } = await dataPromise;
      
      if (dataError) throw dataError;
      
      // Consulta separada para contagem
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
        
      if (countError) throw countError;
      
      return {
        members: data || [],
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
  
  return {
    members: data?.members || [],
    isLoading,
    error,
    filters,
    handleFilterChange,
    page,
    totalPages,
    handlePageChange
  };
};
