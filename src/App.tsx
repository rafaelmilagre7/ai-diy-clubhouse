
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/common/ErrorFallback";

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RouterProvider router={AppRoutes} />
      <Toaster 
        position="top-right" 
        expand={false}
        richColors
        closeButton
      />
    </ErrorBoundary>
  );
}

export default App;
