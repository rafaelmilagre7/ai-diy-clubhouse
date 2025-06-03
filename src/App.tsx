
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ToasterProvider } from '@/components/layout/ToasterProvider';
import { AuthProvider } from './contexts/auth/AuthProvider';
import AppRoutes from './components/routing/AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToasterProvider />
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
