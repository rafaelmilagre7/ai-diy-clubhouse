
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { navigationCache } from "@/utils/navigationCache";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [forceReady, setForceReady] = useState(false);
  const [optimisticLoad, setOptimisticLoad] = useState(false);
  
  const maxRetries = 1; // Reduzido de 2 para 1
  const { sidebarOpen, setSidebarOpen, isMobile } = useSidebarControl();

  // Detectar navegação vinda do LMS
  const isComingFromLMS = location.state?.from?.startsWith?.('/formacao') || 
                         document.referrer.includes('/formacao');

  // OTIMIZAÇÃO 1: Cache check para navegação rápida
  useEffect(() => {
    if (user && isComingFromLMS) {
      const isAdminCached = navigationCache.isAdminVerified(user.id);
      if (isAdminCached) {
        console.log("⚡ [ADMIN-LAYOUT] Cache hit - navegação otimizada do LMS");
        setOptimisticLoad(true);
        setForceReady(true);
        return;
      }
    }
  }, [user, isComingFromLMS]);

  // OTIMIZAÇÃO 2: Timeout absoluto sincronizado
  useEffect(() => {
    const timeoutDuration = 1500; // Reduzido para 1.5s para sincronizar com outros componentes
    
    const absoluteTimeout = setTimeout(() => {
      // Log reduzido para evitar poluir console
      setForceReady(true);
    }, timeoutDuration);

    return () => clearTimeout(absoluteTimeout);
  }, [isComingFromLMS]);

  // OTIMIZAÇÃO 3: Circuit breaker menos agressivo
  useEffect(() => {
    if (retryCount >= maxRetries) {
      console.warn("🚨 [ADMIN-LAYOUT] Max retries atingido");
      setForceReady(true);
    }
  }, [retryCount]);

  // OTIMIZAÇÃO 4: Verificação otimizada para usuários já autenticados
  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoading) {
      if (!user) {
        console.warn("[SECURITY] No authenticated user - redirecting to login");
        navigate("/login", { replace: true });
        return;
      }

      // FALLBACK: Se não conseguiu verificar isAdmin, tentar verificação direta
      if (!isAdmin) {
        // Verificação de emergência usando email (fallback)
        const isEmergencyAdmin = user?.email === 'rafael@viverdeia.ai';
        
        if (!isEmergencyAdmin) {
          console.warn("[SECURITY] Unauthorized admin access attempt");
          toast.error("Acesso negado. Você não tem permissão para acessar a área administrativa.");
          navigate("/dashboard", { replace: true });
          return;
        } else {
          console.warn("[SECURITY] Emergency admin access granted via email fallback");
        }
      }

      // OTIMIZAÇÃO 5: Definir cache após verificação bem-sucedida
      if (user && isAdmin) {
        navigationCache.set(user.id, null, 'admin');
        console.info("[SECURITY] Admin access granted", {
          userId: user.id?.substring(0, 8) + '***',
          cached: true
        });
      }
      
      setRetryCount(0);
    }
  }, [user, isAdmin, isLoading, navigate]);

  // OTIMIZAÇÃO 6: Timeout com retry reduzido
  useEffect(() => {
    if (isLoading && isMounted && !forceReady && !optimisticLoad) {
      const retryTimeout = isComingFromLMS ? 1500 : 2000; // Mais rápido do LMS
      
      const timeoutId = setTimeout(() => {
        if (isLoading && retryCount < maxRetries && !forceReady) {
          console.warn(`[SECURITY] Auth timeout - retry ${retryCount + 1}/${maxRetries}`);
          setRetryCount(prev => prev + 1);
        } else if (isLoading && retryCount >= maxRetries) {
          console.error("[SECURITY] Forçando exibição após timeouts");
          setForceReady(true);
        }
      }, retryTimeout);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isMounted, retryCount, forceReady, optimisticLoad, isComingFromLMS]);

  // OTIMIZAÇÃO 7: Loading state otimista e menos complexo
  if (!isMounted || (isLoading && !forceReady && !optimisticLoad && retryCount < maxRetries)) {
    return (
      <div className="flex min-h-screen w-full bg-background dark">
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          />
        )}
        
        {/* OTIMIZAÇÃO 8: Skeleton simplificado para navegação rápida */}
        <div className="w-64 border-r bg-sidebar p-4 flex flex-col">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            
            <div className="space-y-2">
              {Array(4).fill(null).map((_, i) => ( // Reduzido de 6 para 4
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" /> {/* Reduzido de h-64 para h-32 */}
            
            {/* Feedback otimista para navegação do LMS */}
            {isComingFromLMS && (
              <div className="text-center text-viverblue text-sm">
                ⚡ Retornando para área administrativa...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // OTIMIZAÇÃO 9: Renderização com verificações reduzidas
  if (forceReady || optimisticLoad || (!isLoading && user && isAdmin)) {
    return (
      <div className="flex min-h-screen w-full bg-background dark">
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          />
        )}
        
        <AdminSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        <AdminContent 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        >
          {children || <Outlet />}
        </AdminContent>
      </div>
    );
  }

  // Fallback rápido
  navigate("/login", { replace: true });
  return null;
};

export default AdminLayout;
