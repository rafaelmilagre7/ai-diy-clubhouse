
import React from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToolImage } from "@/hooks/useToolImage";
import { useNavigate } from "react-router-dom";

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
  const { logoUrl, loading, error } = useToolImage({ toolName });
  const navigate = useNavigate();
  
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Navegar para a página da ferramenta na plataforma
  const handleViewTool = () => {
    navigate(`/tools?search=${encodeURIComponent(toolName)}`);
  };

  // Determina se o ícone deve ser a primeira letra ou um logo
  const getToolAvatar = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    
    // Se temos uma URL de logo e não estamos carregando nem temos erros
    if (logoUrl && !loading && !error) {
      return (
        <div className="bg-white h-10 w-10 rounded-md flex items-center justify-center overflow-hidden aspect-square">
          <img 
            src={logoUrl} 
            alt={`Logo ${name}`} 
            className="h-8 w-8 object-contain"
            style={{ aspectRatio: '1/1' }}
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
      <div className="bg-viverblue/20 text-viverblue h-10 w-10 rounded-md flex items-center justify-center font-semibold aspect-square">
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
      
      <div className="mt-auto pt-3 space-y-2">
        <Button 
          variant="default"
          className="w-full bg-viverblue hover:bg-viverblue/90"
          onClick={handleViewTool}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Ver na plataforma
        </Button>
        
        {toolUrl && (
          <Button 
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-white/20 text-white/70 hover:bg-white/5 hover:text-white text-xs"
            onClick={() => window.open(toolUrl, '_blank')}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Site oficial
          </Button>
        )}
      </div>
    </div>
  );
};
