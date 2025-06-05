import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { Toaster } from "sonner";
import { useTheme } from "@/contexts/theme";
import { AuthProvider } from '@/contexts/auth';
import { mainRoutes } from '@/routes/MainRoutes';
import { authRoutes } from '@/routes/AuthRoutes';
import { adminRoutes } from '@/routes/AdminRoutes';
import { onboardingRoutes } from '@/routes/OnboardingRoutes';
import { formacaoRoutes } from '@/routes/FormacaoRoutes';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  const { darkMode, theme, primaryColor } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode, primaryColor]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />
    },
    ...authRoutes,
    ...mainRoutes, // Incluindo as novas rotas principais
    ...adminRoutes,
    ...onboardingRoutes,
    ...formacaoRoutes,
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={`min-h-screen ${theme}`}>
          <Toaster />
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
