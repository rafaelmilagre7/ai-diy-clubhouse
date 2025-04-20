
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToolLogo } from "@/hooks/useToolLogo";
import { BenefitBadge } from "@/components/tools/BenefitBadge";
import { BenefitType } from "@/types/toolTypes";

interface ToolItemProps {
  toolName: string;
  toolUrl: string;
  isRequired: boolean;
  benefitType?: BenefitType;
  hasBenefit?: boolean;
}

export const ToolItem = ({ 
  toolName, 
  toolUrl, 
  isRequired,
  benefitType,
  hasBenefit
}: ToolItemProps) => {
  const { logoUrl, loading } = useToolLogo({ toolName });

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 pb-3 flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={toolName} 
                className="h-full w-full object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="text-xl font-bold text-[#0ABAB5]">${toolName.substring(0, 2).toUpperCase()}</div>`;
                }}
              />
            ) : (
              <div className="text-xl font-bold text-[#0ABAB5]">
                {toolName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-base">{toolName}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {isRequired ? (
                <Badge variant="outline" className="text-xs bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30">
                  Obrigatória
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Opcional
                </Badge>
              )}
              
              {hasBenefit && benefitType && (
                <BenefitBadge type={benefitType} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => window.open(toolUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Acessar ferramenta
        </Button>
      </CardFooter>
    </Card>
  );
};
