
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";
import { useSecureSession } from "@/hooks/useSecureSession";

function App() {
  const { user, isLoading } = useAuth();
  
  // Ativar sessão segura
  useSecureSession({
    maxIdleTime: 60, // 60 minutos
    checkInterval: 180, // 3 minutos
    autoLogoutWarning: 15 // 15 minutos de aviso
  });

  useEffect(() => {
    logger.info('[APP] Inicialização da aplicação', {
      hasUser: !!user,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);

  return (
    <>
      <RouterProvider router={AppRoutes} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  );
}

export default App;
