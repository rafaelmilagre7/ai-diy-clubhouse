
import { useState, useCallback } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";

export const useModuleInteraction = (module: Module, onComplete: () => void) => {
  const { user } = useAuth();
  const { log } = useLogging();
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Log interaction when user interacts with content
  const handleInteraction = useCallback(() => {
    if (hasInteracted) return;
    
    // Mark as interacted and call onComplete
    setHasInteracted(true);
    log("User interacted with module", { 
      module_id: module.id, 
      module_type: module.type,
      solution_id: module.solution_id
    });
    
    // Log interaction in analytics
    if (user) {
      try {
        supabase.from("analytics").insert({
          user_id: user.id,
          event_type: "module_interaction",
          solution_id: module.solution_id,
          module_id: module.id,
          event_data: {
            module_type: module.type,
            interaction_type: "content_viewed",
            timestamp: new Date().toISOString()
          }
        }).then(({ error }) => {
          if (error) {
            console.error("Error logging interaction:", error);
          }
        });
      } catch (e) {
        console.error("Error in interaction logging:", e);
      }
    }
    
    // Notify parent component
    onComplete();
  }, [hasInteracted, module, user, onComplete, log]);
  
  return {
    hasInteracted,
    handleInteraction
  };
};
