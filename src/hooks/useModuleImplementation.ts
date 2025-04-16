import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useModuleImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Fetch solution and modules
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch solution details
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (solutionError) {
          throw solutionError;
        }
        
        setSolution(solutionData as Solution);
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("module_order", { ascending: true });
        
        if (modulesError) {
          throw modulesError;
        }
        
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
          setCurrentModule(modulesData[moduleIdx] as Module || null);
        } else {
          // Create temporary mock modules if none exist
          const mockModules = Array(8).fill(0).map((_, idx) => ({
              id: `mock-${idx}`,
              solution_id: id,
              title: `Module ${idx}`,
              content: {},
              type: ["landing", "overview", "preparation", "implementation", "verification", "results", "optimization", "celebration"][idx],
              module_order: idx,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
          
          setModules(mockModules as Module[]);
          setCurrentModule(mockModules[moduleIdx] as Module || null);
        }
        
        // Fetch user progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError && progressData) {
            setProgress(progressData);
            
            // Parse completed modules from progress data
            if (progressData.completed_modules && Array.isArray(progressData.completed_modules)) {
              setCompletedModules(progressData.completed_modules);
            }
          } else {
            // Create initial progress record if not exists
            const { data: newProgress, error: createError } = await supabase
              .from("progress")
              .insert({
                user_id: user.id,
                solution_id: id,
                current_module: moduleIdx,
                is_completed: false,
                completed_modules: [],
                last_activity: new Date().toISOString(),
              })
              .select()
              .single();
            
            if (!createError && newProgress) {
              setProgress(newProgress);
              setCompletedModules([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdx, user, toast]);
  
  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !id || !progress) return;
      
      try {
        const { error } = await supabase
          .from("progress")
          .update({ 
            current_module: moduleIdx,
            last_activity: new Date().toISOString()
          })
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, id, progress]);
  
  // Navigate to next module
  const handleComplete = () => {
    // Navigate to the next module
    if (moduleIdx < modules.length - 1) {
      navigate(`/implement/${id}/${moduleIdx + 1}`);
    }
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdx > 0) {
      navigate(`/implement/${id}/${moduleIdx - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  // Mark module as completed
  const handleMarkAsCompleted = async () => {
    // Show confirmation modal for last module
    if (moduleIdx >= modules.length - 1) {
      setShowConfirmationModal(true);
      return;
    }
    
    // Otherwise just mark this module as completed
    if (user && progress) {
      try {
        // Add this module to completed modules if not already there
        if (!completedModules.includes(moduleIdx)) {
          const updatedCompletedModules = [...completedModules, moduleIdx];
          
          const { error } = await supabase
            .from("progress")
            .update({ 
              completed_modules: updatedCompletedModules,
              last_activity: new Date().toISOString()
            })
            .eq("id", progress.id);
          
          if (error) {
            throw error;
          }
          
          setCompletedModules(updatedCompletedModules);
          
          toast({
            title: "Módulo concluído!",
            description: "Este módulo foi marcado como concluído com sucesso.",
          });
          
          // Navigate to next module
          if (moduleIdx < modules.length - 1) {
            navigate(`/implement/${id}/${moduleIdx + 1}`);
          }
        }
      } catch (error) {
        console.error("Error marking module as completed:", error);
        toast({
          title: "Erro ao marcar módulo",
          description: "Ocorreu um erro ao tentar marcar o módulo como concluído.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle full implementation confirmation
  const handleConfirmImplementation = async () => {
    if (user && progress) {
      try {
        setIsCompleting(true);
        
        // Add this module to completed modules if not already there
        if (!completedModules.includes(moduleIdx)) {
          const updatedCompletedModules = [...completedModules, moduleIdx];
          setCompletedModules(updatedCompletedModules);
        }
        
        const { error } = await supabase
          .from("progress")
          .update({ 
            is_completed: true,
            completion_date: new Date().toISOString(),
            completed_modules: completedModules.includes(moduleIdx) 
              ? completedModules 
              : [...completedModules, moduleIdx],
            last_activity: new Date().toISOString()
          })
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
        
        // Close the confirmation modal
        setShowConfirmationModal(false);
        
        // Navigate to the solution details page
        toast({
          title: "Implementação concluída!",
          description: "Parabéns! Você concluiu com sucesso a implementação desta solução.",
        });
        
        navigate(`/solution/${id}`);
      } catch (error) {
        console.error("Error completing implementation:", error);
        toast({
          title: "Erro ao concluir implementação",
          description: "Ocorreu um erro ao tentar marcar a implementação como concluída.",
          variant: "destructive",
        });
      } finally {
        setIsCompleting(false);
      }
    }
  };
  
  // Set interaction state for the current module
  const setModuleInteraction = (hasInteracted: boolean) => {
    setHasInteracted(hasInteracted);
  };
  
  // Calculate progress percentage based on completed modules
  const calculateProgress = () => {
    if (!modules.length) return 0;
    return Math.min(100, Math.round((completedModules.length / modules.length) * 100));
  };
  
  return {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    completedModules,
    handleComplete,
    handlePrevious,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    showConfirmationModal,
    setShowConfirmationModal,
    calculateProgress,
    isCompleting,
    hasInteracted,
    setModuleInteraction
  };
};
