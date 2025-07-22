import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface TabProgressData {
  tabId: string;
  completedAt: string;
  progressData?: any;
}

export const useTabProgress = (solutionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  // Buscar progresso das abas - SEMPRE executar o useQuery
  const { data: tabProgressData, isLoading } = useQuery({
    queryKey: ['tab-progress', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id || !solutionId) return [];
      
      const { data, error } = await supabase
        .from('implementation_tab_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .order('completed_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!solutionId,
  });

  // Atualizar estado local quando dados são carregados
  useEffect(() => {
    if (tabProgressData) {
      const completedTabIds = tabProgressData.map(progress => progress.tab_id);
      setCompletedTabs(completedTabIds);
    }
  }, [tabProgressData]);

  // Mutation para marcar aba como completa
  const markTabCompleteMutation = useMutation({
    mutationFn: async ({ tabId, progressData = {} }: { tabId: string; progressData?: any }) => {
      if (!user?.id || !solutionId) throw new Error('User or solution not found');
      
      const { data, error } = await supabase
        .from('implementation_tab_progress')
        .upsert({
          user_id: user.id,
          solution_id: solutionId,
          tab_id: tabId,
          progress_data: progressData,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,solution_id,tab_id'
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tabId }) => {
      // Atualizar estado local imediatamente
      setCompletedTabs(prev => {
        if (!prev.includes(tabId)) {
          return [...prev, tabId];
        }
        return prev;
      });
      
      // Invalidar cache para recarregar dados (sem dependências circulares)
      queryClient.invalidateQueries({ queryKey: ['tab-progress', user?.id, solutionId] });
    },
    onError: (error) => {
      console.error('Erro ao marcar aba como completa:', error);
    }
  });

  // Mutation para resetar progresso de uma aba
  const resetTabProgressMutation = useMutation({
    mutationFn: async (tabId: string) => {
      if (!user?.id || !solutionId) throw new Error('User or solution not found');
      
      const { error } = await supabase
        .from('implementation_tab_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('tab_id', tabId);
      
      if (error) throw error;
    },
    onSuccess: (_, tabId) => {
      // Atualizar estado local
      setCompletedTabs(prev => prev.filter(id => id !== tabId));
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['tab-progress', user?.id, solutionId] });
    },
  });

  const markTabComplete = React.useCallback((tabId: string, progressData?: any) => {
    markTabCompleteMutation.mutate({ tabId, progressData });
  }, [markTabCompleteMutation.mutate]);

  const resetTabProgress = (tabId: string) => {
    resetTabProgressMutation.mutate(tabId);
  };

  const isTabCompleted = (tabId: string) => {
    return completedTabs.includes(tabId);
  };

  const getProgressPercentage = (totalTabs: number) => {
    return totalTabs > 0 ? (completedTabs.length / totalTabs) * 100 : 0;
  };

  return {
    completedTabs,
    isLoading,
    markTabComplete,
    resetTabProgress,
    isTabCompleted,
    getProgressPercentage,
    isMarkingComplete: markTabCompleteMutation.isPending,
    isResetting: resetTabProgressMutation.isPending,
  };
};