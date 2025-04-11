
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MemberHeader } from "./MemberHeader";
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface MemberContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberContent = ({ sidebarOpen, setSidebarOpen }: MemberContentProps) => {
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error messages in console logs
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('infinite recursion') || 
          errorMessage.includes('policy for relation') ||
          errorMessage.includes('Error fetching') ||
          errorMessage.includes('useAuth must be used')) {
        setHasError(true);
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/login';
  };

  return (
    <main
      className={cn(
        "flex-1 overflow-x-hidden transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-20"
      )}
    >
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Page content */}
      <div className="container py-6 px-4 md:px-6">
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro de sessão</AlertTitle>
            <AlertDescription className="flex flex-col space-y-3">
              <p>Ocorreu um problema com sua sessão. Por favor, faça login novamente.</p>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-fit" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Ir para Login
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Outlet />
      </div>
      
      <Toaster position="top-right" />
    </main>
  );
};
