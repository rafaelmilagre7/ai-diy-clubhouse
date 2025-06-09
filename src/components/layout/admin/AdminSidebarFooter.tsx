
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const AdminSidebarFooter = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const handleBackToMember = () => {
    navigate("/dashboard");
    toast.success("Retornando para a área de membro");
  };

  return (
    <div className="mt-auto p-4 border-t border-white/5 space-y-2">
      {/* Botão destacado para voltar à área de membro */}
      <Button 
        variant="default" 
        className="w-full justify-start bg-primary hover:bg-primary-hover text-white"
        onClick={handleBackToMember}
      >
        <ArrowLeft className="h-5 w-5 mr-3" />
        Área de Membro
      </Button>
      
      {/* Botão de logout */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sair
      </Button>
    </div>
  );
};
