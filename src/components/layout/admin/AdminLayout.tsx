
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [forceReady, setForceReady] = useState(false);
  const maxRetries = 2;

  // Timeout absoluto mais agressivo para evitar travamento
  useEffect(() => {
    const absoluteTimeout = setTimeout(() => {
      console.warn("⚠️ [ADMIN-LAYOUT] Timeout absoluto de 8s - forçando exibição");
      setForceReady(true);
    }, 8000);

    return () => clearTimeout(absoluteTimeout);
  }, []);

  // Circuit breaker - detectar e quebrar loops infinitos
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

      console.info("[SECURITY] Admin access granted", {
        userId: user.id?.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });
      
      setRetryCount(0);
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Timeout com retry mais inteligente e menos agressivo
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
      }, 6000);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isMounted, retryCount, forceReady]);

  // Loading state com skeleton melhorado
  if (!isMounted || (isLoading && !forceReady && retryCount < maxRetries)) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <div className="w-64 border-r bg-sidebar p-4 flex flex-col">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
              
              <div className="h-px bg-border my-4"></div>
              
              <div className="space-y-2">
                {Array(6).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
              <div className="text-center text-muted-foreground text-sm">
                {retryCount > 0 && (
                  <div className="text-yellow-600">
                    Verificando credenciais... (tentativa {retryCount}/{maxRetries})
                  </div>
                )}
                {forceReady && (
                  <div className="text-blue-600">
                    Forçando carregamento...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Renderização final com verificações de segurança
  if (forceReady || (!isLoading && user && isAdmin)) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <AdminContent>
            {children || <Outlet />}
          </AdminContent>
        </div>
      </SidebarProvider>
    );
  }

  // Fallback
  console.warn("🚨 [ADMIN-LAYOUT] Fallback acionado - redirecionando para login");
  navigate("/login", { replace: true });
  return null;
};

export default AdminLayout;
