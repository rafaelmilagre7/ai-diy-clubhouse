
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleGoHome = () => {
    window.location.href = '/login';
  };

  const handleReset = () => {
    // Limpar localStorage e tentar novamente
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('supabase') ||
        key.startsWith('sb-') ||
        key.includes('auth') ||
        key.includes('session')
      ) {
        localStorage.removeItem(key);
      }
    });
    
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Oops! Algo deu errado
          </h1>
          <p className="text-neutral-300">
            Ocorreu um erro inesperado na aplicação
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-left">
            <p className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleReset}
            className="bg-viverblue hover:bg-viverblue/90 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir para Login
          </Button>
        </div>

        <div className="text-xs text-neutral-500">
          Se o problema persistir, use o botão "Reset Sistema" no canto inferior direito
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
