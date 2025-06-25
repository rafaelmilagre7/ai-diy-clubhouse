
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import { SimpleAuthProvider } from "./contexts/auth/SimpleAuthProvider";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <RouterProvider router={AppRoutes} />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
