import { QueryClient } from "@tanstack/react-query";

// Configuração otimizada do Query Client para experiência instant-on
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aumenta o tempo que os dados são considerados "frescos"
      staleTime: 1000 * 60 * 5, // 5 minutos
      
      // Mantém os dados em cache por mais tempo
      gcTime: 1000 * 60 * 10, // 10 minutos
      
      // Não refetch ao focar a janela - evita flickering
      refetchOnWindowFocus: false,
      
      // Retry apenas 1 vez para melhorar a percepção de velocidade
      retry: 1,
      
      // Mostrar dados obsoletos enquanto recarrega (substituindo keepPreviousData)
      placeholderData: (previousData) => previousData,
      
      // Sempre usar cache se disponível e atualizar em background
      refetchOnMount: "always",
    },
  },
});
