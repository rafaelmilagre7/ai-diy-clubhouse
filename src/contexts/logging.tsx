
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

// Redireciona para a implementação principal em hooks/useLogging
export const useLogging = (): LoggingContextType => {
  console.log('🔧 Context useLogging: Redirecionando para hook principal');
  
  // Usa a implementação de useLogging do hooks/useLogging.tsx
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
      // Substitui terceiro argumento por propriedade no objeto
      loggingHook.log(message, { ...data, category: "info" });
    }
  };
};

// Implementação do provider redirecionada para o hooks/useLogging.tsx
export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  console.log('🔧 Context LoggingProvider: Redirecionando para provider principal');
  return <OriginalLoggingProvider>{children}</OriginalLoggingProvider>;
};
