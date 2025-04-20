
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { toast } from "sonner";

/**
 * MemberLayout renders the layout structure for member users
 * This includes the sidebar and content area
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  
  // Estado para controlar a visibilidade do sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamanho de tela e ajustar sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Em mobile, fecha o sidebar por padrão
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!mobile && !sidebarOpen) {
        // Em desktop, mantém o sidebar aberto por padrão
        setSidebarOpen(true);
      }
    };

    // Executar na montagem
    handleResize();
    
    // Adicionar listener para resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Log para depuração
  console.log("MemberLayout renderizado:", { 
    profileName: profile?.name,
    profileEmail: profile?.email,
    sidebarOpen,
    isMobile,
    windowWidth: window.innerWidth
  });

  if (!profile) {
    console.log("Perfil não encontrado no MemberLayout");
    toast.error("Erro ao carregar perfil. Tente fazer login novamente.");
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar sempre renderizado, mas pode ter largura 0 */}
      <MemberSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        profileName={profile?.name}
        profileEmail={profile?.email}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
        signOut={signOut}
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
