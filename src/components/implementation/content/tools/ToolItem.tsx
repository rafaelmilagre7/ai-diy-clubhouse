
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface ToolItemProps {
  toolName: string;
  toolUrl?: string;
  isRequired?: boolean;
  hasBenefit?: boolean;
  benefitType?: "discount" | "free" | "special";
}

export const ToolItem = ({
  toolName,
  toolUrl,
  isRequired = false,
  hasBenefit = false,
  benefitType,
}: ToolItemProps) => {
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Determina se o ícone deve ser a primeira letra ou um logo
  const getToolAvatar = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    
    // Aqui poderia ter lógica para mostrar um logo específico
    return (
      <div className="bg-viverblue/20 text-viverblue h-10 w-10 rounded-md flex items-center justify-center font-semibold">
        {firstLetter}
      </div>
    );
  };

  const getBenefitLabel = () => {
    switch (benefitType) {
      case "discount":
        return "Desconto exclusivo";
      case "free":
        return "Versão gratuita";
      case "special":
        return "Oferta especial";
      default:
        return "Benefício exclusivo";
    }
  };

  return (
    <div className="bg-[#1A1E2E] border border-white/10 rounded-lg p-4 flex flex-col h-full shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {getToolAvatar(toolName)}
        <div className="space-y-1">
          <h3 className="font-medium text-neutral-100">{formatName(toolName)}</h3>
          <div className="flex flex-wrap gap-2">
            {isRequired && (
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/20 text-xs">
                Necessário
              </Badge>
            )}
            {hasBenefit && (
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                {getBenefitLabel()}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {toolUrl && (
        <div className="mt-auto pt-3">
          <Button 
            variant="outline"
            className="w-full bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10 hover:text-viverblue"
            onClick={() => window.open(toolUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar ferramenta
          </Button>
        </div>
      )}
    </div>
  );
};
