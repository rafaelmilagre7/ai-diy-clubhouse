
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, Sparkles } from "lucide-react";

interface TrailCardHeaderProps {
  onUpdate: () => void;
  onViewAll?: () => void;
  hasAIContent?: boolean;
}

export const TrailCardHeader: React.FC<TrailCardHeaderProps> = ({ 
  onUpdate, 
  onViewAll,
  hasAIContent = false 
}) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          {hasAIContent && <Sparkles className="h-5 w-5 text-viverblue" />}
          Trilha de Implementação
          {hasAIContent && (
            <span className="text-sm font-normal text-viverblue bg-viverblue/10 px-2 py-1 rounded-full">
              IA
            </span>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={onUpdate}
            variant="outline"
            size="sm"
            className="border-viverblue/40 text-viverblue hover:bg-viverblue/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {onViewAll && (
            <Button
              onClick={onViewAll}
              variant="outline"
              size="sm"
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Tudo
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
