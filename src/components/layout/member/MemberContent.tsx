
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MemberHeader } from "./MemberHeader";
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MemberContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberContent = ({ sidebarOpen, setSidebarOpen }: MemberContentProps) => {
  // Check if the current path is /dashboard to show the error alert
  const isDashboard = window.location.pathname === '/dashboard';
  const hasError = isDashboard && document.querySelector('.destructive'); // Simple check for error message

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
            <AlertDescription>
              Ocorreu um problema com sua sessão. Por favor, clique no botão "Sair" no canto superior direito para voltar à tela de login.
            </AlertDescription>
          </Alert>
        )}
        <Outlet />
      </div>
      
      <Toaster position="top-right" />
    </main>
  );
};
