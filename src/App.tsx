
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from '@/contexts/auth';
import { mainRoutes } from '@/routes/MainRoutes';
import { authRoutes } from '@/routes/AuthRoutes';
import { adminRoutes } from '@/routes/AdminRoutes';
import { onboardingRoutes } from '@/routes/OnboardingRoutes';
import { formacaoRoutes } from '@/routes/FormacaoRoutes';
import { memberRoutes } from '@/routes/MemberRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const root = document.documentElement;
    // Aplicar tema padrão
    root.classList.add('dark');
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />
    },
    // Redirecionamento da rota antiga /solutions para /trilha-implementacao
    {
      path: "/solutions",
      element: <Navigate to="/trilha-implementacao" replace />
    },
    ...authRoutes,
    ...memberRoutes,
    ...mainRoutes,
    ...adminRoutes,
    ...onboardingRoutes,
    ...formacaoRoutes,
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen dark">
          <Toaster />
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
