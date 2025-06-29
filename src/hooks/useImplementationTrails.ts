
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { ImplementationTrail } from '@/lib/supabase/types/implementation';

export const useImplementationTrails = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trails, setTrails] = useState<ImplementationTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrails();
    }
  }, [user]);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTrails(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar trilhas de implementação:', err);
      setError(err.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as trilhas de implementação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrail = async (trailData: Partial<ImplementationTrail>) => {
    try {
      const { data, error } = await supabase
        .from('implementation_trails')
        .insert({
          user_id: user?.id,
          trail_data: trailData.trail_data || {},
          status: trailData.status || 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setTrails(prev => [data, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Trilha de implementação criada com sucesso!',
      });

      return data;
    } catch (err: any) {
      console.error('Erro ao criar trilha:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a trilha de implementação.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTrail = async (id: string, updates: Partial<ImplementationTrail>) => {
    try {
      const { data, error } = await supabase
        .from('implementation_trails')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTrails(prev => prev.map(trail => 
        trail.id === id ? { ...trail, ...data } : trail
      ));

      toast({
        title: 'Sucesso',
        description: 'Trilha atualizada com sucesso!',
      });

      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar trilha:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a trilha.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteTrail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('implementation_trails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrails(prev => prev.filter(trail => trail.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Trilha removida com sucesso!',
      });
    } catch (err: any) {
      console.error('Erro ao deletar trilha:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a trilha.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    trails,
    loading,
    error,
    createTrail,
    updateTrail,
    deleteTrail,
    refetch: fetchTrails,
  };
};
