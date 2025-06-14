
import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { sanitizeData } from "@/components/security/DataSanitizer";

interface LogData {
  [key: string]: any;
}

interface LoggingContextType {
  log: (action: string, data?: LogData) => void;
  logWarning: (action: string, data?: LogData) => void;
  logError: (action: string, error: any, data?: LogData) => any;
  lastError: any;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<any>(null);
  
  const storeLog = useCallback(async (action: string, data: LogData, level: string, user_id: string) => {
    try {
      if (!user_id) return;
      
      const sanitizedPayload = sanitizeData({ ...data, user_id });
      
      logger.info(`Storing log to database`, { action, level, userId: user_id });

      const logEntry = {
        ...sanitizedPayload,
        action,
        level,
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from("analytics")
        .insert({
          user_id,
          event_type: `log_${level}`,
          solution_id: data.solution_id,
          module_id: data.module_id,
          event_data: logEntry
        });
        
      if (error) {
        logger.error("Failed to store log in Supabase", error, { userId: user_id });
      }
    } catch (e) {
      logger.error("Error in logging system (storeLog)", e, { userId: user_id });
    }
  }, []);
  
  const log = useCallback((action: string, data: LogData = {}) => {
    logger.info(action, data);
    
    if (data.critical && data.user_id) {
      storeLog(action, data, "info", data.user_id);
    }
  }, [storeLog]);
  
  const logWarning = useCallback((action: string, data: LogData = {}) => {
    logger.warn(action, data);
    
    if (data.user_id) {
      storeLog(action, data, "warning", data.user_id);
    }
    
    if (data.critical === true) {
      toast({
        title: "Aviso",
        description: action,
        variant: "default",
      });
    }
  }, [toast, storeLog]);
  
  const logError = useCallback((action: string, error: any, data: LogData = {}) => {
    logger.error(action, error, data);
    setLastError(error);
    
    const shouldShowToast = error?.showToast !== false;
    
    if (shouldShowToast) {
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Ocorreu um erro ao carregar o conteúdo. Alguns dados podem não estar disponíveis.",
        variant: "destructive",
      });
    }
    
    const userId = data.user_id || error?.user_id;
    if (userId) {
      const errorData = { 
        ...data,
        error: error?.message || String(error),
        stack: error?.stack,
        showToast: shouldShowToast
      };
      storeLog(action, errorData, "error", userId);
    }
    
    return error;
  }, [toast, storeLog]);
  
  const contextValue: LoggingContextType = {
    log,
    logWarning,
    logError,
    lastError
  };
  
  return (
    <LoggingContext.Provider value={contextValue}>
      {children}
    </LoggingContext.Provider>
  );
};

export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error("useLogging must be used within a LoggingProvider");
  }
  return context;
};
