
import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AppRoutes } from '@/routes/AppRoutes';

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast()
  const [logOnce, setLogOnce] = useState(false);

  useEffect(() => {
    // Log apenas uma vez para evitar spam
    if (!logOnce && !authLoading) {
      if (user) {
        console.log('[APP] Usuário autenticado:', user.email);
      } else {
        console.log('[APP] Nenhum usuário autenticado.');
      }
      setLogOnce(true);
    }
  }, [user, authLoading, logOnce]);

  return (
    <>
      <RouterProvider router={AppRoutes} />
      <Toaster />
    </>
  );
}

export default App;
