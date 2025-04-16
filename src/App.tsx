
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { LoggingProvider } from './hooks/useLogging';
import AppRoutes from './components/routing/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <LoggingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LoggingProvider>
    </AuthProvider>
  );
}

export default App;
