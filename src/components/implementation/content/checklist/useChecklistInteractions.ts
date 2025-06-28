
import { useState } from "react";
import { Module } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";

export const useChecklistInteractions = (module: Module) => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { log, logError } = useLogging();

  const handleCheckChange = async (
    itemId: string, 
    checked: boolean, 
    userChecklist: Record<string, boolean>,
    setUserChecklist: (checklist: Record<string, boolean>) => void
  ) => {
    if (!user || !module?.solution_id) return;

    setSaving(true);
    
    try {
      const updatedChecklist = {
        ...userChecklist,
        [itemId]: checked
      };
      
      // Update local state first for immediate feedback
      setUserChecklist(updatedChecklist);
      
      // Then save to database
      const { error } = await supabase
        .from("user_checklists")
        .upsert({
          user_id: user.id,
          solution_id: module.solution_id,
          checked_items: updatedChecklist,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,solution_id'
        });
        
      if (error) {
        logError("Error saving checklist item", error);
        // Revert on error
        setUserChecklist(userChecklist);
      } else {
        log("Checklist item updated", { item_id: itemId, checked });
      }
    } catch (error) {
      logError("Error updating checklist", error);
      // Revert on error
      setUserChecklist(userChecklist);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItem = (itemId: string) => {
    // This function will be called from the component
    // Implementation will depend on the current state
    log("Toggle item requested", { item_id: itemId });
  };

  return {
    saving,
    handleCheckChange,
    handleToggleItem
  };
};
