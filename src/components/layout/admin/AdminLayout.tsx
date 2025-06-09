
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Verificar autenticação e permissões com retry logic
  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoading) {
      if (!user) {
        console.warn("[SECURITY] No authenticated user - redirecting to login");
        navigate("/login", { replace: true });
        return;
      }

      if (!isAdmin) {
        console.warn("[SECURITY] Unauthorized admin access attempt");
        toast.error("Acesso negado. Você não tem permissão para acessar a área administrativa.");
        navigate("/dashboard", { replace: true });
        return;
      }

      // Log de acesso administrativo (sem dados sensíveis)
      console.info("[SECURITY] Admin access granted", {
        userId: user.id?.substring(0, 8) + '***',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 50)
      });
      
      // Reset retry count em caso de sucesso
      setRetryCount(0);
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Timeout com retry mais inteligente (sem redirecionamento forçado)
  useEffect(() => {
    if (isLoading && isMounted) {
      const timeoutId = setTimeout(() => {
        if (isLoading && retryCount < maxRetries) {
          console.warn(`[SECURITY] Auth timeout - retry ${retryCount + 1}/${maxRetries}`);
          setRetryCount(prev => prev + 1);
          toast.warning(`Verificando credenciais... (tentativa ${retryCount + 1})`);
        } else if (isLoading && retryCount >= maxRetries) {
          console.error("[SECURITY] Auth timeout after retries - redirecting to login");
          toast.error("Timeout na verificação de credenciais");
          navigate("/login", { replace: true });
        }
      }, 15000); // Aumentado para 15 segundos

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isMounted, retryCount, navigate]);

  // Renderização com loading mais seguro
  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0F111A] text-white">
        <div className="w-64 bg-[#0F111A] border-r border-white/5 p-4 flex flex-col">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-white/10" />
            <Skeleton className="h-12 w-12 rounded-full bg-white/10 mx-auto" />
            <Skeleton className="h-4 w-24 bg-white/10 mx-auto" />
            
            <div className="h-px bg-white/5 my-4"></div>
            
            <div className="space-y-2">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-white/10" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/10" />
            {retryCount > 0 && (
              <div className="text-center text-yellow-400 text-sm">
                Verificando credenciais... (tentativa {retryCount}/{maxRetries})
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização final apenas para usuários autorizados
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
