
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import AppRoutes from '@/routes/AppRoutes';

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast()

  useEffect(() => {
    if (authLoading) {
      console.log('[APP] Autenticação ainda carregando...');
    } else if (user) {
      console.log('[APP] Usuário autenticado:', user.email);
    } else {
      console.log('[APP] Nenhum usuário autenticado.');
    }
  }, [user, authLoading]);

  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;
