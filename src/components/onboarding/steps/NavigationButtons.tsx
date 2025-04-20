
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  isSubmitting: boolean;
  onPrevious?: () => void;
}

export const NavigationButtons = ({
  isSubmitting,
  onPrevious,
}: NavigationButtonsProps) => (
  <div className="flex justify-between pt-6">
    <Button 
      type="button" 
      variant="outline" 
      disabled 
      className="min-w-[120px]"
      onClick={onPrevious}
    >
      Anterior
    </Button>
    <Button 
      type="submit" 
      className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Salvando..." : (
        <span className="flex items-center gap-2">
          Próximo
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </Button>
  </div>
);
