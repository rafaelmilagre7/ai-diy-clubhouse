
import React, { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface LogData {
  [key: string]: any;
}

interface LoggingContextType {
  log: (action: string, data?: LogData) => void;
  logWarning: (action: string, data?: LogData) => void;
  logError: (action: string, error: any) => any;
  lastError: any;
}

// Create a context for logging functions
const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// Provider component
export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Safe access to useAuth with fallback
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    console.warn("LoggingProvider: Auth context not available");
    // Continue without auth - logging will work but not save to database
  }
  
  const [lastError, setLastError] = useState<any>(null);
  
  const log = useCallback((action: string, data: LogData = {}) => {
    console.log(`[Log] ${action}:`, data);
    
    // Only store important logs in database
    if (data.critical && user) {
      storeLog(action, data, "info");
    }
  }, [user]);
  
  const logWarning = useCallback((action: string, data: LogData = {}) => {
    console.warn(`[Warning] ${action}:`, data);
    if (user) {
      storeLog(action, data, "warning");
    }
  }, [user]);
  
  const logError = useCallback((action: string, error: any) => {
    console.error(`[Error] ${action}:`, error);
    setLastError(error);
    
    // Show toast notification for errors
    toast({
      title: "Erro ao carregar conteúdo",
      description: "Ocorreu um erro ao carregar o conteúdo. Alguns dados podem não estar disponíveis.",
      variant: "destructive",
    });
    
    if (user) {
      storeLog(action, { 
        error: error?.message || String(error),
        stack: error?.stack
      }, "error");
    }
    
    return error;
  }, [toast, user]);
  
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
  
  // Create the value object for the context
  const contextValue: LoggingContextType = {
    log,
    logWarning,
    logError,
    lastError
  };
  
  // Using createElement instead of JSX since this is a .ts file
  return React.createElement(
    LoggingContext.Provider,
    { value: contextValue },
    children
  );
};

// Hook to use the logging context
export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error("useLogging must be used within a LoggingProvider");
  }
  return context;
};
