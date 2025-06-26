
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { logger } from "@/utils/logger";
import { LoggingErrorBoundary } from "@/components/common/LoggingErrorBoundary";

function AppContent() {
  const { user, isLoading, error } = useSimpleAuth();

  useEffect(() => {
    console.log('[DEBUG-APP-CONTENT] 🎬 Inicialização do conteúdo da aplicação:', {
      hasUser: !!user,
      isLoading,
      hasError: !!error,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });

    logger.info('[APP-CONTENT] Inicialização do conteúdo da aplicação', {
      hasUser: !!user,
      isLoading,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading, error]);

  if (error) {
    console.error('[DEBUG-APP-CONTENT] 💥 Erro crítico na aplicação:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <div className="mb-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Erro na Aplicação</h2>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-100 text-sm break-words">{error}</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('[DEBUG-APP-CONTENT] 🔄 Recarregando página...');
                window.location.reload();
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Recarregar Página
            </button>
            <button
              onClick={() => {
                console.log('[DEBUG-APP-CONTENT] 🏠 Indo para home...');
                window.location.href = '/';
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🏠 Ir para Início
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-400">
            Se o problema persistir, contate o suporte.
          </div>
        </div>
      </div>
    );
  }

  console.log('[DEBUG-APP-CONTENT] ✅ Renderizando RouterProvider');

  return (
    <LoggingErrorBoundary>
      <RouterProvider router={AppRoutes} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </LoggingErrorBoundary>
  );
}

export default AppContent;
