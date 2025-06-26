
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleAuthProvider } from "@/contexts/auth/SimpleAuthProvider";
import { LoggingProvider } from "@/hooks/useLogging";

// Importar validação de ambiente
import "@/config/env-validation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <LoggingProvider>
          <App />
        </LoggingProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
