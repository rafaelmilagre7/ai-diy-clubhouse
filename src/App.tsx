
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoggingProvider } from './contexts/logging';
import { AuthProvider } from './contexts/auth';

// Importações corretas para os componentes de onboarding
import Onboarding from './pages/onboarding/Onboarding';
import PersonalInfo from './pages/onboarding/steps/PersonalInfo';
import ProfessionalData from './pages/onboarding/steps/ProfessionalData';
import BusinessContext from './pages/onboarding/steps/BusinessContext';
import AIExperience from './pages/onboarding/steps/AIExperience';
import BusinessGoalsClub from './pages/onboarding/steps/BusinessGoalsClub';
import ExperiencePersonalization from './pages/onboarding/steps/ExperiencePersonalization';
import ComplementaryInfo from './pages/onboarding/steps/ComplementaryInfo';
import Review from './pages/onboarding/steps/Review';
import TrailGeneration from './pages/onboarding/steps/TrailGeneration';

// Importação correta do AppRoutes que contém todas as rotas organizadas
import AppRoutes from './components/routing/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LoggingProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </LoggingProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
