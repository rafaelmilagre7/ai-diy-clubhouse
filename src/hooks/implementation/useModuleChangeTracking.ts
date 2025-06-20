
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { logProgressEvent } from "./utils/progressUtils";

/**
 * Hook to track and update progress when module changes
 */
export const useModuleChangeTracking = (
  moduleIdx: number,
  progressId: string | undefined,
  solutionId: string | undefined
) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !solutionId || !progressId) return;
      
      try {
        logProgressEvent(log, "Updating progress for module change", { 
          moduleIdx, 
          progressId,
          solution_id: solutionId
        });
        
        const { error } = await supabase
          .from("progress")
          .update({ 
            current_module: moduleIdx,
            last_activity: new Date().toISOString()
          } as any)
          .eq("id", progressId as any);
        
        if (error) {
          throw error;
        }
        
        log("Progress updated successfully");
      } catch (error) {
        logError("Error updating progress", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, solutionId, progressId, log, logError]);
};
