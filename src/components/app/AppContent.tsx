
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { LoggingErrorBoundary } from "@/components/common/LoggingErrorBoundary";

function AppContent() {
  return (
    <LoggingErrorBoundary>
      <RouterProvider router={AppRoutes} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </LoggingErrorBoundary>
  );
}

export default AppContent;
