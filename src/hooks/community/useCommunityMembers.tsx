
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/forumTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface MembersFilters {
  search: string;
  industry: string;
  role: string;
  availability: string;
}

const ITEMS_PER_PAGE = 12;

export const useCommunityMembers = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<MembersFilters>({
    search: '',
    industry: '',
    role: '',
    availability: ''
  });

  // Buscar membros com filtros e paginação
  const { 
    data: membersData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['community-members', currentPage, filters],
    queryFn: async () => {
      console.log('Buscando membros da comunidade...');
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Excluir o próprio usuário se estiver logado
      if (user?.id) {
        query = query.neq('id', user.id);
      }

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,current_position.ilike.%${filters.search}%`);
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters.role) {
        query = query.ilike('current_position', `%${filters.role}%`);
      }

      if (filters.availability === 'available') {
        query = query.eq('available_for_networking', true);
      } else if (filters.availability === 'busy') {
        query = query.eq('available_for_networking', false);
      }

      // Paginação
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      // Ordenar por último acesso (com fallback para created_at)
      query = query.order('last_active', { ascending: false, nullsFirst: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar membros:', error);
        throw error;
      }

      console.log(`Encontrados ${data?.length || 0} membros de ${count || 0} total`);

      return {
        members: data || [],
        total: count || 0
      };
    },
    staleTime: 30000, // 30 segundos
    retry: 2
  });

  // Buscar setores únicos para filtros (apenas dos que têm dados)
  const { data: availableIndustries = [] } = useQuery({
    queryKey: ['available-industries'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('industry')
        .not('industry', 'is', null)
        .not('industry', 'eq', '')
        .neq('id', user?.id || '');

      if (error) throw error;

      const industries = [...new Set(data?.map(item => item.industry).filter(Boolean))];
      return industries.sort();
    }
  });

  // Buscar cargos únicos para filtros (apenas dos que têm dados)
  const { data: availableRoles = [] } = useQuery({
    queryKey: ['available-roles'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_position')
        .not('current_position', 'is', null)
        .not('current_position', 'eq', '')
        .neq('id', user?.id || '');

      if (error) throw error;

      const roles = [...new Set(data?.map(item => item.current_position).filter(Boolean))];
      return roles.sort();
    }
  });

  const members = membersData?.members || [];
  const totalItems = membersData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: Partial<MembersFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset para primeira página quando filtros mudam
  };

  const handleRetry = () => {
    refetch();
  };

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  return {
    members,
    isLoading,
    isError,
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
