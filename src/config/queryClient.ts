
import { QueryClient } from "@tanstack/react-query";

// Configuração simplificada do Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuração básica sem cache agressivo
      staleTime: 0, 
      gcTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: true,
      retry: 1,
      networkMode: 'online'
    }
  },
});
