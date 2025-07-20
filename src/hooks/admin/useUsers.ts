
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useUsers = () => {
  const [localLoading, setLocalLoading] = useState(false);

  const {
    data: users,
    isLoading: queryLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<Profile[]> => {
      setLocalLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } finally {
        setLocalLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const isLoading = queryLoading || localLoading;

  const updateUserRole = async (userId: string, newRole: string) => {
    setLocalLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Perfil do usuário atualizado com sucesso',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar usuário',
        variant: 'destructive',
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    users: users || [],
    isLoading,
    error,
    refetch,
    updateUserRole
  };
};
