
import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

interface LoadingState {
  auth: boolean;
  profile: boolean;
  dashboard: boolean;
  solutions: boolean;
  progress: boolean;
  secondary: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setMultipleLoading: (states: Partial<LoadingState>) => void;
  isAnyLoading: boolean;
  isCriticalLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    auth: true,
    profile: true,
    dashboard: false,
    solutions: false,
    progress: false,
    secondary: false
  });

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMultipleLoading = useCallback((states: Partial<LoadingState>) => {
    setLoadingStates(prev => ({ ...prev, ...states }));
  }, []);

  const isAnyLoading = useMemo(() => 
    Object.values(loadingStates).some(Boolean)
  , [loadingStates]);

  const isCriticalLoading = useMemo(() => 
    loadingStates.auth || loadingStates.profile
  , [loadingStates.auth, loadingStates.profile]);

  const value = useMemo(() => ({
    loadingStates,
    setLoading,
    setMultipleLoading,
    isAnyLoading,
    isCriticalLoading
  }), [loadingStates, setLoading, setMultipleLoading, isAnyLoading, isCriticalLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
