
import { createContext, useContext, ReactNode } from "react";

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

export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error("useLogging must be used within a LoggingProvider");
  }
  return context;
};

export const LoggingProvider = ({ children }: { children: ReactNode }) => {
  const log = (message: string, data: LogData = {}, category: string = "general") => {
    console.log(`[${category}] ${message}`, data);
  };

  const error = (message: string, data: LogData = {}) => {
    console.error(`[ERROR] ${message}`, data);
  };

  const warn = (message: string, data: LogData = {}) => {
    console.warn(`[WARN] ${message}`, data);
  };

  const info = (message: string, data: LogData = {}) => {
    console.info(`[INFO] ${message}`, data);
  };

  return (
    <LoggingContext.Provider value={{ log, error, warn, info }}>
      {children}
    </LoggingContext.Provider>
  );
};
