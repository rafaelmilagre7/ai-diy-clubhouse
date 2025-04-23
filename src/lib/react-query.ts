
import { QueryClient } from '@tanstack/react-query';

// Cliente React Query centralizado para toda a aplicação
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar os dados obsoletos
      gcTime: 10 * 60 * 1000, // 10 minutos antes de remover dados do cache
    },
  },
});
