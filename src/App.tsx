
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import AppRoutes from "@/components/routing/AppRoutes";

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Oops! Algo deu errado</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
