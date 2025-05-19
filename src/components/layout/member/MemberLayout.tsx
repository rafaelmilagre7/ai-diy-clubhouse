
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { MemberSidebar } from "./MemberSidebar";
import { useAuth } from "@/contexts/auth";
import { clearAuthTokens } from "@/contexts/auth/utils/authUtils";
import { getUserDisplayName, isUserAdmin } from "@/utils/auth/adminUtils";
import LoadingScreen from "@/components/common/LoadingScreen";
import AuthSession from "@/components/auth/AuthSession";

const MemberLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Log para diagnóstico
  console.log("MemberLayout renderizando:", { 
    userExists: !!user, 
    profileExists: !!profile, 
    isLoading, 
    isAdmin,
    userEmail: user?.email,
    profileRole: profile?.role
  });
  
  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("MemberLayout: Usuário não autenticado, redirecionando para login");
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    try {
      console.log("MemberLayout: Iniciando logout");
      
      // Limpar tokens antes
      clearAuthTokens();
      
      // Fazer logout
      await signOut();
      
      console.log("MemberLayout: Logout concluído");
      
      // Redirecionamento é tratado dentro da função signOut
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Obter nome e outras informações do usuário
  const userName = getUserDisplayName(user, profile);
  const userEmail = profile?.email || user?.email || "";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  
  // Obter iniciais do nome para exibir quando não há avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  
  // Verificar se o usuário é admin usando função centralizada
  const userIsAdmin = isUserAdmin(user, profile);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <>
        <AuthSession />
        <LoadingScreen message="Carregando área de membros..." />
      </>
    );
  }

  // Se não temos usuário após carregar, não renderizar nada
  // (o efeito de redirecionamento cuidará disso)
  if (!user && !isLoading) {
    return <AuthSession />;
  }

  return (
    <>
      <AuthSession />
      <div className="flex h-screen bg-background">
        <MemberSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          profileName={userName}
          profileEmail={userEmail}
          profileAvatar={avatarUrl}
          getInitials={getInitials}
          signOut={handleSignOut}
          isAdmin={userIsAdmin}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default MemberLayout;
