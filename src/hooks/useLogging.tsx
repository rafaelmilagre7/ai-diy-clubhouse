
import React, { createContext, useContext, ReactNode } from 'react';
import { useLogging } from './useLogging';
import { LoggingContextType } from './useLogging';

// Criar o contexto de logging
const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// Provider component para o contexto de logging
export const LoggingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loggingService = useLogging();
  
  return (
    <LoggingContext.Provider value={loggingService}>
      {children}
    </LoggingContext.Provider>
  );
};

// Hook para usar o contexto de logging
export const useLoggingContext = () => {
  const context = useContext(LoggingContext);
  
  if (!context) {
    throw new Error('useLoggingContext must be used within a LoggingProvider');
  }
  
  return context;
};

// Re-exportando o hook useLogging para compatibilidade
export { useLogging };
