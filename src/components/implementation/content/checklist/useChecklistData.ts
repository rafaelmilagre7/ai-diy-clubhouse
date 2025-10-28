
import { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { ChecklistItem, CheckpointData, extractChecklistFromSolution, initializeUserChecklist, convertCheckpointToChecklist, handleChecklistError } from "./checklistUtils";

export const useChecklistData = (module: Module) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [userChecklist, setUserChecklist] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchData = async () => {
      if (!module?.solution_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar dados da solução
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .maybeSingle();
        
        if (error) {
          logError("Error fetching solution:", error);
          return;
        }
        
        if (!data) {
          log("No solution found with id", { id: module.solution_id });
          setLoading(false);
          return;
        }
        
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Extrair checklist da solução
        const extractedChecklist = extractChecklistFromSolution(solutionData);
        
        if (extractedChecklist.length === 0) {
          log("No checklist found in solution", { solutionId: solutionData.id });
          setChecklist([]);
          setUserChecklist({});
        } else {
          setChecklist(extractedChecklist);
          
          // Inicializar checklist do usuário
          const initialUserChecklist = initializeUserChecklist(extractedChecklist);
          
          // Se usuário está logado, buscar progresso específico
          if (user) {
            const { data: userData, error: userError } = await supabase
              .from("user_checklists")
              .select("*")
              .eq("user_id", user.id)
              .eq("solution_id", module.solution_id)
              .maybeSingle();
              
            if (userError && userError.code !== "PGRST116") {
              logError("Error fetching user checklist:", userError);
              setUserChecklist(initialUserChecklist);
            } else if (userData) {
              // Parse dos dados JSON se necessário
              const userItems = typeof userData.checked_items === 'string' 
                ? JSON.parse(userData.checked_items) 
                : userData.checked_items;
                
              setUserChecklist(userItems as Record<string, boolean>);
            } else {
              setUserChecklist(initialUserChecklist);
            }
          } else {
            setUserChecklist(initialUserChecklist);
          }
        }
      } catch (err) {
        const errorInfo = handleChecklistError(err, "fetchData");
        logError("Error fetching solution data:", errorInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [module, user, log, logError]);

  return {
    solution,
    checklist,
    userChecklist,
    setUserChecklist,
    loading
  };
};
