
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, startTransition } from "react";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";
import { useSecureSession } from "@/hooks/useSecureSession";

function App() {
  const { user, isLoading } = useAuth();
  
  // Configuração de sessão segura mais relaxada para desenvolvimento
  useSecureSession({
    maxIdleTime: import.meta.env.DEV ? 120 : 60, // 2h dev, 1h prod
    checkInterval: import.meta.env.DEV ? 300 : 180, // 5 min dev, 3 min prod  
    autoLogoutWarning: 15
  });

  useEffect(() => {
    // Log simplificado para evitar overhead - wrapped em startTransition
    if (import.meta.env.DEV) {
      startTransition(() => {
        logger.info('[APP] App initialized', {
          hasUser: !!user,
          isLoading
        });
      });
    }
  }, [user, isLoading]);

  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
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
