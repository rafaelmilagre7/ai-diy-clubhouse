
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { supabase } from "@/lib/supabase";
import { Module, Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useModuleImplementation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string; 
  }>();
  
  // Compatibilidade entre URLs /implement/:id/:moduleIdx e /implementation/:id/:moduleIdx
  const currentModuleIdx = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(currentModuleIdx);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { log, logError } = useLogging("useModuleImplementation");
  
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Buscar dados da solução
  const { 
    data: solution,
    isLoading: solutionLoading
  } = useQuery({
    queryKey: ['implementationSolution', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();
          
        if (error) throw error;
        if (!data) throw new Error(`Solução não encontrada: ${id}`);
        
        return data as Solution;
      } catch (err) {
        logError("Erro ao buscar solução", { error: err });
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
  
  // Buscar módulos
  const { 
    data: modules = [], 
    isLoading: modulesLoading 
  } = useQuery({
    queryKey: ['implementationModules', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
        const { data, error } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
          
        if (error) throw error;
        return data as Module[];
      } catch (err) {
        logError("Erro ao buscar módulos", { error: err });
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
  
  // Buscar progresso
  const {
    data: progress,
    isLoading: progressLoading
  } = useQuery({
    queryKey: ['implementationProgress', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      try {
        const { data, error } = await supabase
          .from("progress")
          .select("*")
          .eq("solution_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        return data;
      } catch (err) {
        logError("Erro ao buscar progresso", { error: err });
        return null;
      }
    },
    enabled: !!id && !!user,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });
  
  // Mutation para criar progresso
  const createProgressMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from("progress")
        .insert({
          user_id: user.id,
          solution_id: id,
          current_module: moduleIdxNumber,
          is_completed: false,
          completed_modules: [],
          last_activity: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['implementationProgress', id, user?.id], data);
      }
    }
  });
  
  // Efeito para definir o módulo atual baseado no índice
  useEffect(() => {
    if (modules.length > 0) {
      if (moduleIdxNumber < modules.length) {
        setCurrentModule(modules[moduleIdxNumber]);
      } else if (modules.length > 0) {
        setCurrentModule(modules[0]);
        navigate(`/implement/${id}/0`, { replace: true });
      }
    }
  }, [modules, moduleIdxNumber, id, navigate]);
  
  // Efeito para atualizar módulos completados quando o progresso muda
  useEffect(() => {
    if (progress) {
      if (progress.completed_modules && Array.isArray(progress.completed_modules)) {
        setCompletedModules(progress.completed_modules);
      } else {
        setCompletedModules([]);
      }
    }
  }, [progress]);
  
  // Efeito para criar progresso se não existir
  useEffect(() => {
    const shouldCreateProgress = !progressLoading && !progress && user && id && !createProgressMutation.isPending;
    
    if (shouldCreateProgress) {
      createProgressMutation.mutate();
    }
  }, [progress, progressLoading, user, id, createProgressMutation.isPending]);
  
  const loading = solutionLoading || modulesLoading || progressLoading || createProgressMutation.isPending;
  
  return {
    solution,
    modules,
    currentModule,
    completedModules,
    setCompletedModules,
    progress,
    loading
  };
};
