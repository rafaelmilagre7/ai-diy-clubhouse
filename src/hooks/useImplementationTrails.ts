
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { ImplementationTrail } from '@/lib/supabase/types/implementation';

export const useImplementationTrails = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar trilhas do usuário
  const { data: trails = [], isLoading } = useQuery({
    queryKey: ['implementation-trails', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ImplementationTrail[];
    },
    enabled: !!user?.id
  });

  // Criar nova trilha
  const createTrail = useMutation({
    mutationFn: async (trailData: Partial<ImplementationTrail>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('implementation_trails')
        .insert({
          user_id: user.id,
          ...trailData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Trilha de implementação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['implementation-trails'] });
    },
    onError: (error: any) => {
      console.error('Erro ao criar trilha:', error);
      toast.error('Erro ao criar trilha de implementação');
    }
  });

  return {
    trails,
    loading: isLoading,
    createTrail: createTrail.mutate
  };
};
