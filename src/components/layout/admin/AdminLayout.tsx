
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [forceReady, setForceReady] = useState(false);
  const maxRetries = 2; // Reduzido para evitar loops
  
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();

  // CORREÇÃO 1: Timeout absoluto mais agressivo para evitar travamento
  useEffect(() => {
    const absoluteTimeout = setTimeout(() => {
      console.warn("⚠️ [ADMIN-LAYOUT] Timeout absoluto de 8s - forçando exibição");
      setForceReady(true);
    }, 8000); // Reduzido de 15s para 8s

    return () => clearTimeout(absoluteTimeout);
  }, []);

  // CORREÇÃO 2: Circuit breaker - detectar e quebrar loops infinitos
  useEffect(() => {
    if (retryCount >= maxRetries) {
      console.warn("🚨 [ADMIN-LAYOUT] Circuit breaker ativo - muitas tentativas");
      setForceReady(true);
      toast.warning("Sistema demorou para carregar. Forçando exibição...");
    }
  }, [retryCount]);

  // Verificar autenticação e permissões com retry mais inteligente
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
        timestamp: new Date().toISOString()
      });
      
      // Reset retry count em caso de sucesso
      setRetryCount(0);
    }
  }, [user, isAdmin, isLoading, navigate]);

  // CORREÇÃO 3: Timeout com retry mais inteligente e menos agressivo
  useEffect(() => {
    if (isLoading && isMounted && !forceReady) {
      const timeoutId = setTimeout(() => {
        if (isLoading && retryCount < maxRetries && !forceReady) {
          console.warn(`[SECURITY] Auth timeout - retry ${retryCount + 1}/${maxRetries}`);
          setRetryCount(prev => prev + 1);
          toast.warning(`Verificando credenciais... (${retryCount + 1}/${maxRetries})`);
        } else if (isLoading && (retryCount >= maxRetries || forceReady)) {
          console.error("[SECURITY] Forçando exibição após timeouts");
          setForceReady(true);
        }
      }, 6000); // Reduzido para 6 segundos

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isMounted, retryCount, forceReady]);

  // CORREÇÃO 4: Renderização com loading mais seguro e circuit breaker
  if (!isMounted || (isLoading && !forceReady && retryCount < maxRetries)) {
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
            <div className="text-center text-white/70 text-sm">
              {retryCount > 0 && (
                <div className="text-yellow-400">
                  Verificando credenciais... (tentativa {retryCount}/{maxRetries})
                </div>
              )}
              {forceReady && (
                <div className="text-blue-400">
                  Forçando carregamento...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CORREÇÃO 5: Renderização final com verificações adicionais de segurança
  if (forceReady || (!isLoading && user && isAdmin)) {
    return (
      <div className="flex min-h-screen bg-background w-full">
        <AdminSidebar />
        
        <AdminContent 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
        >
          {children || <Outlet />}
        </AdminContent>
      </div>
    );
  }

  // Fallback - não deveria chegar aqui, mas por segurança
  console.warn("🚨 [ADMIN-LAYOUT] Fallback acionado - redirecionando para login");
  navigate("/login", { replace: true });
  return null;
};

export default AdminLayout;
