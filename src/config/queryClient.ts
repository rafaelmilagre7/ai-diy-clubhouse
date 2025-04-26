
import { QueryClient } from "@tanstack/react-query";

// Configuração super otimizada do Query Client para experiência realmente instantânea
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduz drasticamente o número de fetches
      staleTime: 1000 * 60 * 2, // 2 minutos 
      
      // Mantém os dados em cache por mais tempo
      gcTime: 1000 * 60 * 10, // 10 minutos
      
      // Não refetch automático ao focar janela - controle manual para evitar flicker
      refetchOnWindowFocus: false,
      
      // Retry apenas 1 vez para melhorar a percepção de velocidade
      retry: 1,
      
      // Mostrar dados obsoletos enquanto recarrega
      placeholderData: (previousData) => previousData,
      
      // Reduz rede - não refetch automático ao montar componente se tiver dados
      refetchOnMount: false,
      
      // Desativa refetch automático em segundo plano - fazer manualmente quando necessário
      refetchInterval: false,
      
      // Otimização de rede - busca rede apenas quando necessário 
      networkMode: 'offlineFirst'
    },
    mutations: {
      // Otimização para mutações mais responsivas
      networkMode: 'offlineFirst'
    }
  },
});
