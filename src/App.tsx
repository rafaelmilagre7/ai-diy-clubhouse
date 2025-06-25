
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { logger } from "@/utils/logger";

function App() {
  const { user, isLoading } = useSimpleAuth();

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
