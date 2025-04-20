
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BusinessNavButtonsProps {
  onPrevious?: () => void;
  isSubmitting: boolean;
}

export const BusinessNavButtons: React.FC<BusinessNavButtonsProps> = ({
  onPrevious,
  isSubmitting
}) => {
  return (
    <>
      <div className="self-start mb-3">
        <Button
          variant="ghost"
          onClick={onPrevious}
          className="flex items-center gap-2 text-[#0ABAB5] px-1 py-1 hover:bg-[#eafaf9] rounded-lg"
          style={{ fontWeight: 500 }}
          type="button"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Voltar
        </Button>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-[#0ABAB5] hover:bg-[#099388] font-semibold text-white transition-colors rounded-xl text-lg py-2 mt-2 shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : "Avançar para a próxima etapa"}
      </Button>
    </>
  );
};
