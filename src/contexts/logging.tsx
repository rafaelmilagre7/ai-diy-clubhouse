
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

// Redirecionamento para a implementação principal
export const useLogging = (): LoggingContextType => {
  const loggingHook = useLoggingHook();
  
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
      loggingHook.log(message, { ...data, category: "info" });
    }
  };
};

export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
