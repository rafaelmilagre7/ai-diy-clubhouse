
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
    
    // Navegar de volta para a lista de soluções
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
