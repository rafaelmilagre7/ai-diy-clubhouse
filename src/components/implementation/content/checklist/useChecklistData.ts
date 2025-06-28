
import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useLogging } from "@/hooks/useLogging";

export interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
}

export const extractChecklistFromSolution = (solution: any): ChecklistItem[] => {
  // Extract checklist from solution content or other fields
  // This is a placeholder implementation
  return [];
};

export const initializeUserChecklist = (checklist: ChecklistItem[]): Record<string, boolean> => {
  const userChecklist: Record<string, boolean> = {};
  checklist.forEach(item => {
    userChecklist[item.id] = item.checked;
  });
  return userChecklist;
};

export const useChecklistData = (module: Module) => {
  const [solution, setSolution] = useState<any | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [userChecklist, setUserChecklist] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchData = async () => {
      if (!module?.solution_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch solution data
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
        
        setSolution(data);
        
        // Extract checklist items from solution
        let extractedChecklist = extractChecklistFromSolution(data);
        
        // If no items in solution checklist, try fetching from implementation_checkpoints
        if (extractedChecklist.length === 0) {
          const { data: checkpointData, error: checkpointError } = await supabase
            .from("implementation_checkpoints")
            .select("*")
            .eq("solution_id", module.solution_id)
            .order("checkpoint_order", { ascending: true });
            
          if (checkpointError) {
            logError("Error fetching checkpoints:", checkpointError);
          } else if (checkpointData && checkpointData.length > 0) {
            extractedChecklist = checkpointData.map((item: any) => ({
              id: item.id,
              title: item.description,
              checked: false
            }));
          } else {
            log("No checklist or implementation_checkpoints found", { solutionId: data.id });
          }
        }
        
        setChecklist(extractedChecklist);
        
        // Initialize user checklist state
        const initialUserChecklist = initializeUserChecklist(extractedChecklist);
        
        // If user is logged in, try to fetch their progress from the progress table
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", module.solution_id)
            .maybeSingle();
              
          if (progressError) {
            logError("Error fetching user progress:", progressError);
          } else if (progressData) {
            // Use progress data if available
            // For now, just use the initial checklist
            setUserChecklist(initialUserChecklist);
          } else {
            setUserChecklist(initialUserChecklist);
          }
        } else {
          setUserChecklist(initialUserChecklist);
        }
      } catch (err) {
        logError("Error fetching solution data:", err);
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
