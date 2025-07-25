
import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToolImage } from "@/hooks/useToolImage";

interface ToolItemProps {
  toolName: string;
  toolUrl?: string;
  toolId?: string;
  isRequired?: boolean;
  hasBenefit?: boolean;
  benefitType?: "discount" | "free" | "special";
}

export const ToolItem = ({
  toolName,
  toolUrl,
  toolId,
  isRequired = false,
  hasBenefit = false,
  benefitType,
}: ToolItemProps) => {
  const { logoUrl, loading, error } = useToolImage({ toolName });
  
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Determina se o ícone deve ser a primeira letra ou um logo
  const getToolAvatar = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    
    // Se temos uma URL de logo e não estamos carregando nem temos erros
    if (logoUrl && !loading && !error) {
      return (
        <div className="bg-white h-10 w-10 rounded-md flex items-center justify-center overflow-hidden">
          <img 
            src={logoUrl} 
            alt={`Logo ${name}`} 
            className="h-full w-full object-contain"
            onError={(e) => {
              // Em caso de erro ao carregar a imagem, mostrar a letra inicial
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-viverblue/20');
              e.currentTarget.parentElement?.classList.remove('bg-white');
              const fallback = document.createElement('div');
              fallback.className = 'font-semibold text-viverblue';
              fallback.textContent = firstLetter;
              e.currentTarget.parentElement?.appendChild(fallback);
            }} 
          />
        </div>
      );
    }
    
    // Fallback para quando não temos o logo
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
      
      {toolId ? (
        <div className="mt-auto pt-3">
          <Button 
            variant="outline"
            className="w-full bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10 hover:text-viverblue"
            onClick={() => window.open(`https://app.viverdeia.ai/tools/${toolId}`, '_blank')}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Ver ferramenta
          </Button>
        </div>
      ) : toolUrl && (
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
