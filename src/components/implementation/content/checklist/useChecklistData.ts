
import { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { ChecklistItem, extractChecklistFromSolution, initializeUserChecklist, handleChecklistError } from "./checklistUtils";

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
        
        // Ensure data is of Solution type
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Extract checklist items from solution
        const extractedChecklist = extractChecklistFromSolution(solutionData);
        
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
            const checkpointChecklist: ChecklistItem[] = checkpointData.map((item: any) => ({
              id: item.id,
              title: item.description,
              checked: false
            }));
            
            setChecklist(checkpointChecklist);
          } else {
            log("No checklist or implementation_checkpoints found", { solutionId: solutionData.id });
            setChecklist([]);
          }
        } else {
          setChecklist(extractedChecklist);
        }
        
        let finalChecklist = checklist.length > 0 ? checklist : extractedChecklist;
        // Initialize user checklist state
        const initialUserChecklist = initializeUserChecklist(finalChecklist);
        
        // If user is logged in, fetch their specific checklist progress
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("user_checklists")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", module.solution_id)
            .maybeSingle();
              
          if (userError) {
            logError("Error fetching user checklist:", userError);
          } else if (userData) {
            // Parse the JSON data if it's a string
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
