
import { createContext, useContext, ReactNode } from "react";
import { useLogging as useLoggingHook } from "@/hooks/useLogging";

export type LogData = {
  [key: string]: any;
};

interface LoggingContextType {
  log: (message: string, data?: LogData, category?: string) => void;
  error: (message: string, data?: LogData) => void;
  warn: (message: string, data?: LogData) => void;
  info: (message: string, data?: LogData) => void;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// Redireciona para a implementação principal em hooks/useLogging
export const useLogging = (): LoggingContextType => {
  // Usa a implementação de useLogging do hooks/useLogging.tsx
  const loggingHook = useLoggingHook();
  
  // Adapta a interface para manter compatibilidade com o código existente
  return {
    log: (message: string, data: LogData = {}, category: string = "general") => {
      loggingHook.log(message, { ...data, category });
    },
    error: (message: string, data: LogData = {}) => {
      loggingHook.logError(message, { ...data, message });
    },
    warn: (message: string, data: LogData = {}) => {
      loggingHook.logWarning(message, data);
    },
    info: (message: string, data: LogData = {}) => {
      loggingHook.log(message, data, "info");
    }
  };
};

// Implementação do provider redirecionada para o hooks/useLogging.tsx
export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  // Apenas repassa o children, já que o verdadeiro provider está em App.tsx
  return <>{children}</>;
};
