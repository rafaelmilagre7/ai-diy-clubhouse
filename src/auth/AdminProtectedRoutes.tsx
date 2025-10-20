
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

export const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const timeoutRef = useRef<number | null>(null);
  
  // Log detalhado do estado de autenticação
  useEffect(() => {
    const info = {
      hasUser: !!user,
      userId: user?.id?.substring(0, 8),
      userEmail: user?.email?.substring(0, 3) + '***',
      hasProfile: !!profile,
      profileRoleId: profile?.role_id,
      profileRoleName: profile?.user_roles?.name,
      profileLegacyRole: profile?.role,
      hasUserRoles: !!profile?.user_roles,
      isAdmin,
      isLoading,
      loadingTimeout,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔒 [ADMIN-CHECK] Estado atual:', info);
    setDebugInfo(JSON.stringify(info, null, 2));
  }, [user, profile, isAdmin, isLoading, loadingTimeout]);
  
  // Configurar timeout de carregamento com mais tolerância
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.error('⏱️ [ADMIN-CHECK] Timeout de carregamento excedido!');
        setLoadingTimeout(true);
      }, 10000); // 10 segundos para maior tolerância
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  // Se timeout foi excedido mas ainda não temos perfil, mostrar erro detalhado
  if (loadingTimeout && !profile) {
    console.error('❌ [ADMIN-CHECK] Timeout excedido sem carregar perfil');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-md">
        <div className="max-w-md w-full bg-card p-lg rounded-lg shadow-lg space-y-md">
          <h2 className="text-xl font-bold text-destructive">Erro de Carregamento</h2>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar suas permissões. Por favor, tente novamente.
          </p>
          <details className="text-xs bg-muted p-3 rounded">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 overflow-auto">{debugInfo}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-primary text-primary-foreground py-sm rounded hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    console.log("🔒 [ADMIN-CHECK] Sem usuário autenticado, redirecionando para login");
    toast.error("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Aguardar o perfil carregar (com verificação robusta)
  if (!profile && isLoading) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Se não tem perfil após carregamento, algo está errado
  if (!profile) {
    console.error("❌ [ADMIN-CHECK] Perfil não encontrado após carregamento");
    toast.error("Erro ao carregar seu perfil. Por favor, tente novamente.");
    return <Navigate to="/dashboard" replace />;
  }

  // CRÍTICO: Verificar se usuário completou onboarding antes de verificar permissões
  if (profile.onboarding_completed !== true) {
    console.log("📝 [ADMIN-CHECK] Usuário precisa completar onboarding primeiro");
    toast.info("Complete seu onboarding primeiro para acessar esta área");
    return <Navigate to="/onboarding" replace />;
  }

  // Verificação final de admin com log detalhado
  if (!isAdmin) {
    console.error("❌ [ADMIN-CHECK] Acesso negado - usuário não é admin:", {
      userId: user.id?.substring(0, 8),
      email: user.email?.substring(0, 3) + '***',
      roleName: profile.user_roles?.name,
      roleId: profile.role_id,
      permissions: profile.user_roles?.permissions,
      isAdmin
    });
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Usuário é administrador, renderiza as rotas protegidas
  console.log("✅ [ADMIN-CHECK] Acesso concedido a área admin");
  return <>{children}</>;
};
