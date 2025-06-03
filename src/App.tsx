
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ToasterProvider } from '@/components/layout/ToasterProvider';
import { PerformanceProvider } from '@/contexts/performance/PerformanceProvider';
import { useAuth } from './contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import AppRoutes from './components/routing/AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <PerformanceProvider>
        <MainAppContent />
        <ToasterProvider />
        <Toaster />
      </PerformanceProvider>
    </Router>
  );
};

const MainAppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }

  return <AppRoutes />;
};

export default App;
