
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
  variant?: "primary" | "secondary" | "default";
  previousButtonClassName?: string; // Nova propriedade para personalizar o estilo do botão anterior
  submitButtonClassName?: string; // Nova propriedade para personalizar o estilo do botão de envio
}

export const NavigationButtons = ({ 
  isSubmitting, 
  onPrevious, 
  submitText = "Próximo", 
  loadingText = "Salvando...",
  showPrevious = true,
  previousDisabled = false,
  className,
  variant = "default",
  previousButtonClassName,
  submitButtonClassName
}: NavigationButtonsProps) => {
  // Função para determinar a classe de estilo do botão com base na variante
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-viverblue hover:bg-viverblue-dark text-white";
      case "secondary":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      default:
        return "bg-viverblue hover:bg-viverblue/90 text-white";
    }
  };

  // Função para lidar com o clique no botão anterior
  const handlePreviousClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir comportamento padrão
    
    if (onPrevious) {
      console.log("[NavigationButtons] Botão anterior clicado, executando callback");
      onPrevious();
    } else {
      console.warn("[NavigationButtons] Botão anterior clicado mas nenhum callback fornecido");
    }
  };

  return (
    <div className={cn("flex justify-between pt-6", className)}>
      {showPrevious ? (
        <Button
          type="button"
          variant="outline"
          disabled={previousDisabled || isSubmitting}
          className={cn("min-w-[120px] transition-all border-neutral-600 hover:bg-[#252842] hover:text-white", previousButtonClassName)}
          onClick={handlePreviousClick}
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </span>
        </Button>
      ) : (
        <div /> /* Espaçador quando não tem botão anterior */
      )}
      
      <Button
        type="submit"
        className={cn("min-w-[120px] transition-all", getButtonStyle(), submitButtonClassName)}
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
};
