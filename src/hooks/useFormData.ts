import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook genérico para buscar dados de formulários
export function useFormData<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutos
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutos
  });
}

// Hook genérico para mutações de formulários
export function useFormMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}

// Hooks específicos para dados comuns
export function useForumCategories() {
  return useFormData(
    ['forum-categories'],
    async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data;
    }
  );
}

export function useUserRoles() {
  return useFormData(
    ['user-roles'],
    async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  );
}

export function useToolCategories() {
  return useFormData(
    ['tool-categories'],
    async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('category')
        .neq('category', null);
      
      if (error) throw error;
      
      // Extrair categorias únicas
      const categories = [...new Set(data.map(item => item.category))];
      return categories.filter(Boolean);
    }
  );
}