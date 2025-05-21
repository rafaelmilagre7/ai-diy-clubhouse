
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Profile } from '@/types/forumTypes';

interface MemberFilters {
  search?: string;
  industry?: string;
  role?: string;
}

interface UseCommunityMembersProps {
  initialFilters?: MemberFilters;
  itemsPerPage?: number;
}

export const useCommunityMembers = ({
  initialFilters = {},
  itemsPerPage = 12
}: UseCommunityMembersProps = {}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<MemberFilters>(initialFilters);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const fetchMembers = async () => {
    try {
      // Construir a query base
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('name', null);

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

      // Buscar total de membros (para paginação)
      const countQuery = query;
      const { count, error: countError } = await countQuery.count();
      
      if (countError) throw countError;

      // Aplicar paginação
      const { data, error } = await query
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
        .order('name', { ascending: true });

      if (error) throw error;

      // Buscar indústrias disponíveis para filtro
      if (!availableIndustries.length) {
        const { data: industries, error: indError } = await supabase
          .from('profiles')
          .select('industry')
          .neq('industry', null)
          .order('industry');
        
        if (indError) throw indError;
        
        if (industries) {
          const uniqueIndustries = industries
            .map(item => item.industry)
            .filter((value): value is string => 
              value !== null && value !== undefined && value !== '')
            .filter((value, index, self) => self.indexOf(value) === index);
          
          setAvailableIndustries(uniqueIndustries);
        }
      }

      // Buscar cargos disponíveis para filtro
      if (!availableRoles.length) {
        const { data: roles, error: rolesError } = await supabase
          .from('profiles')
          .select('current_position')
          .neq('current_position', null)
          .order('current_position');
        
        if (rolesError) throw rolesError;
        
        if (roles) {
          const uniqueRoles = roles
            .map(item => item.current_position)
            .filter((value): value is string => 
              value !== null && value !== undefined && value !== '')
            .filter((value, index, self) => self.indexOf(value) === index);
          
          setAvailableRoles(uniqueRoles);
        }
      }

      return {
        members: data as Profile[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw error;
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['communityMembers', currentPage, filters],
    queryFn: fetchMembers,
    meta: {
      onError: (err: Error) => {
        console.error('Erro na consulta de membros:', err);
      }
    }
  });

  const members = data?.members || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters: Partial<MemberFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Resetar para primeira página ao filtrar
  };

  const handleRetry = () => {
    toast.info('Atualizando lista de membros...');
    refetch();
  };

  return {
    members,
    isLoading,
    isError,
    error,
    totalCount,
    totalPages,
    currentPage,
    filters,
    availableIndustries,
    availableRoles,
    handlePageChange,
    handleFilterChange,
    handleRetry
  };
};
