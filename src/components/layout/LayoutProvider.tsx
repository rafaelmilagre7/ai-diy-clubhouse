
import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider = ({ children }: LayoutProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default LayoutProvider;
