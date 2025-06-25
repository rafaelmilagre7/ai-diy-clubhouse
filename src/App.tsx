
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { logger } from "@/utils/logger";

function App() {
  const { user, isLoading, error } = useSimpleAuth();

  useEffect(() => {
    logger.info('[APP] Inicialização da aplicação', {
      hasUser: !!user,
      isLoading,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });

    console.log('[APP] Estado da aplicação:', {
      hasUser: !!user,
      isLoading,
      error,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading, error]);

  if (error) {
    console.error('[APP] Erro crítico na aplicação:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-xl font-bold mb-4">Erro na Aplicação</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  console.log('[APP] Renderizando RouterProvider');

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
