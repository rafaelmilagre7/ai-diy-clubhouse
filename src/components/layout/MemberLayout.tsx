
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import AuthSession from "@/components/auth/AuthSession"; 
import { getUserDisplayName, isUserAdmin } from "@/utils/auth/adminUtils";

/**
 * MemberLayout renderiza a estrutura de layout para usuários membros
 * Isso inclui a barra lateral e a área de conteúdo
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, setIsAdmin, signOut } = useAuth();
  
  // Verificar se o usuário é admin usando a função centralizada
  const userIsAdmin = isUserAdmin(user, profile);
  
  // Sincronizar o estado isAdmin no contexto de autenticação
  useEffect(() => {
    if (setIsAdmin) {
      console.log("MemberLayout: Sincronizando estado isAdmin no contexto:", userIsAdmin);
      setIsAdmin(userIsAdmin);
    }
  }, [userIsAdmin, setIsAdmin, user, profile]);
  
  console.log("MemberLayout renderizando:", {
    userExists: !!user,
    profileExists: !!profile,
    isAdmin: userIsAdmin,
    userEmail: user?.email,
    profileRole: profile?.role
  });
  
  // Estado para controlar a visibilidade da barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recuperar estado do localStorage, padrão é aberto em desktop
    const savedState = localStorage.getItem("sidebarOpen");
    console.log("Estado inicial da sidebar recuperado:", savedState);
    return savedState !== null ? savedState === "true" : window.innerWidth >= 768;
  });

  // Overlay para o menu mobile
  const [showOverlay, setShowOverlay] = useState(false);

  // Atualizar overlay baseado no estado da sidebar em mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setShowOverlay(isMobile && sidebarOpen);
  }, [sidebarOpen]);

  // Fechar menu ao clicar no overlay
  const handleOverlayClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Efeito para persistir o estado da barra lateral
  useEffect(() => {
    console.log("Persistindo estado da sidebar:", sidebarOpen);
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

  // Função para obter iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Detectar tamanho de tela e ajustar barra lateral em dispositivos móveis
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      console.log("Detectado redimensionamento:", { isMobile, width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);
    // Executar verificação inicial
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Forçar o tema escuro 
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  // Garantir que o perfil seja carregado ou usar dados do usuário como fallback
  const profileName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || null;
  const profileEmail = profile?.email || user?.email || null;
  const profileAvatar = profile?.avatar_url;

  return (
    <div className="flex min-h-screen bg-[#0F111A] overflow-hidden">
      {/* Incluir o componente AuthSession para inicializar e verificar a autenticação */}
      <AuthSession />
      
      {/* Overlay para dispositivos móveis */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Barra lateral garantida para ser renderizada sempre */}
      <MemberSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
        signOut={signOut}
        isAdmin={userIsAdmin} // Passando o valor calculado com isUserAdmin
      />
      
      {/* Conteúdo principal */}
      <MemberContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </MemberContent>
    </div>
  );
};

export default MemberLayout;
