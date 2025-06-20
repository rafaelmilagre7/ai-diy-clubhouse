
import { useState } from "react";
import { Solution, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";
import { handleChecklistError } from "./checklistUtils";

export const useChecklistInteractions = (solution: Solution | null) => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { log, logError } = useLogging();

  // Handle checkbox change and save to user's progress
  const handleCheckChange = async (
    itemId: string, 
    checked: boolean,
    userChecklist: Record<string, boolean>,
    setUserChecklist: (checklist: Record<string, boolean>) => void
  ) => {
    try {
      // Update local state first for immediate feedback
      const newUserChecklist = { ...userChecklist };
      newUserChecklist[itemId] = checked;
      setUserChecklist(newUserChecklist);
      
      // Only save to database if user is logged in
      if (user && solution) {
        setSaving(true);
        
        // Check if a record already exists
        const { data, error } = await supabase
          .from("user_checklists")
          .select("*")
          .eq("user_id", user.id as any)
          .eq("solution_id", solution.id as any)
          .single();
          
        if (error && error.code !== "PGRST116") { // PGRST116 = Not found, which is expected if no record yet
          throw error;
        }
        
        if (data) {
          // Update existing record
          await supabase
            .from("user_checklists")
            .update({
              checked_items: newUserChecklist,
              updated_at: new Date().toISOString()
            } as any)
            .eq("id", (data as any).id as any);
        } else {
          // Create new record
          await supabase
            .from("user_checklists")
            .insert({
              user_id: user.id,
              solution_id: solution.id,
              checked_items: newUserChecklist,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any);
        }
        
        // Log user interaction
        log("User toggled checklist item", { 
          solution_id: solution.id,
          item_id: itemId,
          checked
        });
      }
    } catch (error) {
      logError("Error saving checklist progress:", error);
      toast.error("Erro ao salvar progresso do checklist");
      
      // Revert the change in UI if save fails
      const revertedChecklist = { ...userChecklist };
      revertedChecklist[itemId] = !checked;
      setUserChecklist(revertedChecklist);
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleCheckChange
  };
};
