
import React, { createContext, useContext, ReactNode } from 'react';
import { SolutionData } from '@/hooks/solution/useSolutionDataCentralized';

interface SolutionDataContextType {
  data: SolutionData | undefined;
  isLoading: boolean;
  error: Error | null;
}

const SolutionDataContext = createContext<SolutionDataContextType | undefined>(undefined);

interface SolutionDataProviderProps {
  children: ReactNode;
  data: SolutionData | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const SolutionDataProvider = ({ children, data, isLoading, error }: SolutionDataProviderProps) => {
  return (
    <SolutionDataContext.Provider value={{ data, isLoading, error }}>
      {children}
    </SolutionDataContext.Provider>
  );
};

export const useSolutionDataContext = () => {
  const context = useContext(SolutionDataContext);
  if (context === undefined) {
    throw new Error('useSolutionDataContext must be used within a SolutionDataProvider');
  }
  return context;
};
