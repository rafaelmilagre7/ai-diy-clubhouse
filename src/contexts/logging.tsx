
import { createContext, useContext, ReactNode } from "react";
import { useLogging as useLoggingHook, LoggingProvider as OriginalLoggingProvider } from "@/hooks/useLogging";

export type LogData = {
  [key: string]: any;
};

interface LoggingContextType {
  log: (message: string, data?: LogData, category?: string) => void;
  error: (message: string, data?: LogData) => void;
  warn: (message: string, data?: LogData) => void;
  info: (message: string, data?: LogData) => void;
}

// Implementação simplificada que não causa dependência circular
const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    // Fallback silencioso para evitar erros
    return {
      log: () => {},
      error: () => {},
      warn: () => {},
      info: () => {}
    };
  }
  return context;
};

// Provider simplificado
export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  // Implementação básica de logging
  const contextValue: LoggingContextType = {
    log: (message: string, data: LogData = {}, category: string = "general") => {
      console.log(`[${category.toUpperCase()}] ${message}`, data);
    },
    error: (message: string, data: LogData = {}) => {
      console.error(`[ERROR] ${message}`, data);
    },
    warn: (message: string, data: LogData = {}) => {
      console.warn(`[WARN] ${message}`, data);
    },
    info: (message: string, data: LogData = {}) => {
      console.info(`[INFO] ${message}`, data);
    }
  };

  return (
    <LoggingContext.Provider value={contextValue}>
      {children}
    </LoggingContext.Provider>
  );
};
