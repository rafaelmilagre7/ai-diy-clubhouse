
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

// REDIRECIONAMENTO PARA A IMPLEMENTAÇÃO PRINCIPAL
export const useLogging = (): LoggingContextType => {
  // Usa a implementação principal do hooks/useLogging.tsx
  const loggingHook = useLoggingHook();
  
  // Adapta a interface para manter compatibilidade com o código existente
  return {
    log: (message: string, data: LogData = {}, category: string = "general") => {
      // Agora passamos category dentro do objeto data
      loggingHook.log(message, { ...data, category });
    },
    error: (message: string, data: LogData = {}) => {
      loggingHook.logError(message, { ...data, message });
    },
    warn: (message: string, data: LogData = {}) => {
      loggingHook.logWarning(message, data);
    },
    info: (message: string, data: LogData = {}) => {
      loggingHook.log(message, { ...data, category: "info" });
    }
  };
};

// Redirecionamento do provider para o hooks/useLogging.tsx
export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  return <OriginalLoggingProvider>{children}</OriginalLoggingProvider>;
};
