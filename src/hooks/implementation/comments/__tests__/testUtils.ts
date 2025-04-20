
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

// Função helper para criar um wrapper do React Query
export const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: PropsWithChildren<{}>) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const wrapper = createWrapper();
