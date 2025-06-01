
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";

interface MinimalTrailEmptyStateProps {
  onRegenerate: () => void;
}

export const MinimalTrailEmptyState: React.FC<MinimalTrailEmptyStateProps> = ({ onRegenerate }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-viverblue/20">
          <Wand2 className="h-4 w-4 text-viverblue" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3 w-3 text-viverblue" />
            <span className="text-sm font-medium text-white">Trilha de Implementação IA</span>
          </div>
          <p className="text-xs text-neutral-400">
            Gere sua trilha personalizada baseada no seu perfil
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onRegenerate}
        className="bg-viverblue hover:bg-viverblue/90 text-white h-8 px-3 text-xs"
      >
        <Sparkles className="mr-1 h-3 w-3" />
        Gerar Trilha
      </Button>
    </div>
  );
};
