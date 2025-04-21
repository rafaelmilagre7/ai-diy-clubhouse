
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonsProps {
  isSubmitting: boolean;
  onPrevious?: () => void;
  submitText?: string;
  loadingText?: string;
  showPrevious?: boolean;
  previousDisabled?: boolean;
  className?: string;
}

export const NavigationButtons = ({ 
  isSubmitting, 
  onPrevious, 
  submitText = "Próximo", 
  loadingText = "Salvando...",
  showPrevious = true,
  previousDisabled = false,
  className
}: NavigationButtonsProps) => (
  <div className={cn("flex justify-between pt-6", className)}>
    {showPrevious ? (
      <Button
        type="button"
        variant="outline"
        disabled={previousDisabled || isSubmitting}
        className="min-w-[120px] transition-all"
        onClick={onPrevious}
      >
        <span className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </span>
      </Button>
    ) : (
      <div /> // Espaçador quando não tem botão anterior
    )}
    
    <Button
      type="submit"
      className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 transition-all"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {submitText}
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </Button>
  </div>
);
