
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { toast } from "sonner";

/**
 * MemberLayout renderiza a estrutura de layout para usuários membros
 * Isso inclui a barra lateral e a área de conteúdo
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  
  // Estado para controlar a visibilidade da barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recuperar estado do localStorage, padrão é aberto em desktop
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? savedState === "true" : window.innerWidth >= 768;
  });

  // Overlay para o menu mobile
  const [showOverlay, setShowOverlay] = useState(false);

  // Log para debugging de layout e navegação
  useEffect(() => {
    console.log("MemberLayout renderizado para rota:", location.pathname, {
      profile: !!profile,
      sidebarOpen
    });
  }, [location.pathname, profile, sidebarOpen]);

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
      if (isMobile && sidebarOpen) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Executar verificação inicial
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  // Forçar o tema escuro 
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  // Handler para signOut que ignora o retorno
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F111A] overflow-hidden">
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
        profileName={profile?.name || null}
        profileEmail={profile?.email || null}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
        signOut={handleSignOut}
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
