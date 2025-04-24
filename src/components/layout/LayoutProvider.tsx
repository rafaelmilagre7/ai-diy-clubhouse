
import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Toaster } from "sonner";

interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * LayoutProvider - Componente principal que fornece contextos globais para a aplicação
 * Centraliza os providers para autenticação, gerenciamento de estado e notificações
 */
const LayoutProvider = ({ children }: LayoutProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster 
          position="bottom-right"
          expand={false}
          closeButton={false}
          richColors
          duration={2000}
          visibleToasts={1}
          className="!bg-transparent"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              fontSize: '0.875rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default LayoutProvider;
