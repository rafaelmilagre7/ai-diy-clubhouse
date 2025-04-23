
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const SolutionBackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
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
