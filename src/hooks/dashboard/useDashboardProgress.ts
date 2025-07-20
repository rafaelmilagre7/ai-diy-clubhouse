
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

interface DashboardProgress {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  loading: boolean;
  error: any;
  isEmpty: boolean;
}

export const useDashboardProgress = (solutions: Solution[] = []): DashboardProgress => {
  const { user } = useAuth();
  
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("progress")
        .select("solution_id, is_completed, completed_at, last_activity, created_at")
        .eq("user_id", user.id);
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!(user?.id),
  });

  const processedData = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!progressData || !Array.isArray(progressData)) {
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }

    const progressMap = new Map();
    progressData.forEach(progress => {
      progressMap.set(progress.solution_id, progress);
    });

    const active: Solution[] = [];
    const completed: Solution[] = [];
    const recommended: Solution[] = [];

    solutions.forEach(solution => {
      const progress = progressMap.get(solution.id);
      
      if (!progress) {
        recommended.push(solution);
      } else if (progress.is_completed) {
        completed.push(solution);
      } else {
        active.push(solution);
      }
    });

    return {
      active,
      completed,
      recommended,
      isEmpty: false
    };
  }, [solutions, progressData]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};

// Manter compatibilidade com exportações existentes
export const useOptimizedDashboardProgress = useDashboardProgress;

// Tipos para compatibilidade
export interface Dashboard {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
}

export interface UserProgress {
  solution_id: string;
  is_completed: boolean;
  completed_at?: string;
  last_activity?: string;
}
