
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface LogData {
  [key: string]: any;
}

export const useLogging = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [lastError, setLastError] = useState<any>(null);
  
  const log = useCallback((action: string, data: LogData = {}) => {
    console.log(`[Log] ${action}:`, data);
    
    // Only store important logs in database
    if (data.critical) {
      storeLog(action, data, "info");
    }
  }, []);
  
  const logWarning = useCallback((action: string, data: LogData = {}) => {
    console.warn(`[Warning] ${action}:`, data);
    storeLog(action, data, "warning");
  }, []);
  
  const logError = useCallback((action: string, error: any) => {
    console.error(`[Error] ${action}:`, error);
    setLastError(error);
    
    // Show toast notification for errors
    toast({
      title: "Erro ao carregar conteúdo",
      description: "Ocorreu um erro ao carregar o conteúdo. Alguns dados podem não estar disponíveis.",
      variant: "destructive",
    });
    
    storeLog(action, { 
      error: error?.message || String(error),
      stack: error?.stack
    }, "error");
    
    return error;
  }, [toast]);
  
  const storeLog = async (action: string, data: LogData, level: string) => {
    if (!user) return;
    
    try {
      const logEntry = {
        user_id: user.id,
        action,
        data,
        level,
        solution_id: data.solution_id,
        module_id: data.module_id,
        created_at: new Date().toISOString(),
      };
      
      // Store in analytics table
      const { error } = await supabase
        .from("analytics")
        .insert({
          user_id: user.id,
          event_type: `log_${level}`,
          solution_id: data.solution_id, 
          module_id: data.module_id,
          event_data: logEntry
        });
        
      if (error) {
        console.error("Failed to store log:", error);
      }
    } catch (e) {
      console.error("Error in logging system:", e);
    }
  };
  
  return {
    log,
    logWarning,
    logError,
    lastError
  };
};
