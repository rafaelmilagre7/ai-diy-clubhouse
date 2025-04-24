
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

export const SolutionBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { log } = useLogging("SolutionBackButton");

  const handleBack = () => {
    // Log para debug antes de navegar
    log("Clique no botão voltar", { currentPath: location.pathname });
    
    // Se o usuário vier de uma página de implementação, voltar para ela
    if (location.state && location.state.from === "implementation") {
      log("Voltando para implementação", { from: location.state.from });
      navigate(-1);
      return;
    }
    
    // Verificar se veio de uma página específica para voltar
    if (location.state && location.state.from) {
      log("Voltando para origem", { from: location.state.from });
      navigate(location.state.from);
      return;
    }
    
    // Navegar de volta para a lista de soluções
    log("Voltando para lista de soluções");
    navigate("/solutions");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
      size="sm"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Voltar para soluções
    </Button>
  );
};
