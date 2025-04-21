
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { ImplementationTrail } from "./ImplementationTrail";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useNavigate } from "react-router-dom";

export const DashboardLayout = () => {
  const location = useLocation();
  const { progress, isLoading } = useProgress();
  const navigate = useNavigate();

  // Verificar se o onboarding foi completado
  useEffect(() => {
    if (!isLoading && progress && !progress.is_completed) {
      // Se não estiver na página de onboarding, redirecionar
      if (!location.pathname.includes('/onboarding')) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [progress, isLoading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conteúdo principal */}
          <div className="md:col-span-2">
            <Outlet />
          </div>
          
          {/* Sidebar com trilha de implementação */}
          <div className="md:col-span-1 space-y-6">
            <ImplementationTrail />
          </div>
        </div>
      </main>
    </div>
  );
};
