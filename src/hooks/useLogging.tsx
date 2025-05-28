
import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  const [lastError, setLastError] = useState<any>(null);
  
  console.log('🔧 LoggingProvider: Inicializando provider');
  
  // Funções de logging independentes de auth
  const log = useCallback((action: string, data: LogData = {}) => {
    console.log(`[Log] ${action}:`, data);
    
    // Armazenar logs críticos apenas se tivermos um user_id
    if (data.critical && data.user_id) {
      storeLog(action, data, "info", data.user_id);
    }
  }, []);
  
  const logWarning = useCallback((action: string, data: LogData = {}) => {
    console.warn(`[Warning] ${action}:`, data);
    
    // Armazenar avisos apenas se tivermos um user_id
    if (data.user_id) {
      storeLog(action, data, "warning", data.user_id);
    }
    
    // Mostrar toast apenas para avisos críticos
    if (data.critical === true) {
      toast({
        title: "Aviso",
        description: action,
        variant: "default",
      });
    }
  }, [toast]);
  
  const logError = useCallback((action: string, error: any) => {
    console.error(`[Error] ${action}:`, error);
    setLastError(error);
    
    // Verificar se o erro deve mostrar um toast (padrão é mostrar)
    const shouldShowToast = error?.showToast !== false;
    
    // Show toast notification for errors that should be shown
    if (shouldShowToast) {
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Ocorreu um erro ao carregar o conteúdo. Alguns dados podem não estar disponíveis.",
        variant: "destructive",
      });
    }
    
    // Armazenar erros apenas se tivermos um user_id
    if (error?.user_id) {
      storeLog(action, { 
        error: error?.message || String(error),
        stack: error?.stack,
        showToast: shouldShowToast
      }, "error", error.user_id);
    }
    
    return error;
  }, [toast]);
  
  const storeLog = async (action: string, data: LogData, level: string, user_id: string) => {
    try {
      // Verificar se temos o user_id antes de armazenar
      if (!user_id) return;
      
      const logEntry = {
        user_id,
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
          user_id,
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
  
  const contextValue = {
    log,
    logWarning,
    logError,
    lastError
  };
  
  console.log('✅ LoggingProvider: Provider configurado com sucesso');
  
  return (
    <LoggingContext.Provider value={contextValue}>
      {children}
    </LoggingContext.Provider>
  );
};

// Hook to use the logging context with fallback gracioso
export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  
  // Fallback gracioso se o provider não estiver disponível
  if (context === undefined) {
    console.warn('⚠️ useLogging: Provider não encontrado, usando fallback');
    
    // Retornar implementação básica de fallback
    return {
      log: (action: string, data?: LogData) => {
        console.log(`[Fallback Log] ${action}:`, data);
      },
      logWarning: (action: string, data?: LogData) => {
        console.warn(`[Fallback Warning] ${action}:`, data);
      },
      logError: (action: string, error: any) => {
        console.error(`[Fallback Error] ${action}:`, error);
        return error;
      },
      lastError: null
    };
  }
  
  console.log('✅ useLogging: Hook configurado corretamente');
  return context;
};
