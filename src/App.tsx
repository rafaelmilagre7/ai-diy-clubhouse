
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { LoggingProvider } from './hooks/useLogging';
import AppRoutes from './components/routing/AppRoutes';
import { Toaster } from './components/ui/toaster';
import AuthSession from './components/auth/AuthSession';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <LoggingProvider>
        <Router>
          <AuthSession />
          <AppRoutes />
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </Router>
      </LoggingProvider>
    </AuthProvider>
  );
}

export default App;
